import { ObjectId } from "mongodb";
import { HttpError } from "../Util/HttpError";
import { type TypedRequest } from "./Types/Request";
import { type Response, type NextFunction } from "express";
import { users, posts, feeds, client } from "../Util/Database";
import { type AddPost, type UpdatePost, type PostParams } from "./Types/Post";

/**
 *  @description -> This controller class implements all the handlers for /post subroutes
 */
class PostController {
  /**
   *  @description -> utility function to handle post related ops for post/feed coll in mongodb
   */
  private async postTransaction(
    userId: ObjectId,
    username: string,
    content: string,
    type: "add" | "update" | "delete",
    postId: ObjectId | null
  ) {
    const session = client.startSession();
    let isModified = false;
    try {
      session.startTransaction();
      switch (type) {
        case "add":
          {
            const { insertedId: newPostId } = await posts.insertOne({
              author_id: userId,
              username,
              content: content,
              created_at: new Date().valueOf(),
              updated_at: -1,
            });

            isModified = true;

            await feeds.updateOne(
              { _id: userId },
              { $push: { feeds: newPostId }, $inc: { length: 1 } },
              { session }
            );

            postId = newPostId;
          }
          break;

        case "update":
          {
            if (!postId) {
              throw new Error("postId missing");
            }
            let { matchedCount } = await posts.updateOne(
              { _id: postId, author_id: userId },
              { $set: { content, updated_at: new Date().valueOf() } },
              { session }
            );

            isModified = Boolean(matchedCount);

            if (isModified) {
              await feeds.updateOne(
                { _id: userId },
                { $pull: { feeds: postId } },
                { session }
              );
              await feeds.updateOne(
                { _id: userId },
                { $push: { feeds: postId } },
                { session }
              );
            }
          }
          break;
        case "delete":
          {
            if (!postId) {
              throw new Error("postId missing");
            }
            let { deletedCount } = await posts.deleteOne(
              { _id: postId, author_id: userId },
              { session }
            );

            isModified = Boolean(deletedCount);

            if (isModified) {
              await feeds.updateOne(
                { _id: userId },
                { $pull: { feeds: postId }, $inc: { length: -1 } },
                { session }
              );
            }
          }
          break;
      }

      await session.commitTransaction();
      return { postId, isModified };
    } catch (error) {
      console.log("An error occurred during the transaction:" + error);
      await session.abortTransaction();
      return Promise.reject(error);
    } finally {
      await session.endSession();
    }
  }

  /**
   *  @description -> utility function to pre compute feeds in mongodb
   */
  private async postBackgroundOps(
    userId: ObjectId,
    postId: ObjectId,
    type: "add" | "update" | "delete"
  ) {
    try {
      const user = await users.findOne(
        {
          _id: userId,
        },
        { projection: { followers: 1 } }
      );

      if (!user) {
        throw new Error("user not found");
      }

      const followers = user.followers;

      switch (type) {
        case "add":
          {
            await feeds.updateMany(
              { _id: { $in: followers } },
              { $push: { feeds: postId }, $inc: { length: 1 } }
            );
          }
          break;

        case "update":
          {
            await feeds.updateMany(
              { _id: { $in: followers } },
              { $pull: { feeds: postId }, $inc: { length: -1 } }
            );
            await feeds.updateMany(
              { _id: { $in: followers } },
              { $push: { feeds: postId }, $inc: { length: 1 } }
            );
          }
          break;
        case "delete":
          {
            await feeds.updateMany(
              { _id: { $in: followers } },
              { $pull: { feeds: postId }, $inc: { length: -1 } }
            );
          }
          break;
      }

      console.log(`background ops for postId: ${postId} completed`);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   *  @description -> to add a tweet
   */
  public async add(
    req: TypedRequest<AddPost>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { userId, username } = res.locals.user;
      const content = req.body.content;
      // add doc to posts collection
      // push post doc id to feeds doc
      const { postId } = await this.postTransaction(
        userId,
        username,
        content,
        "add",
        null
      );
      // fetch user followers
      // update many - push post doc id to all followers feeds doc
      if (postId) {
        this.postBackgroundOps(userId, postId, "add").then((flag: boolean) =>
          console.log(flag)
        );
      }
      return res.status(201).json({ message: "Created", postId });
    } catch (err) {
      next(new HttpError(err));
    }
  }

  /**
   *  @description -> to update a tweet
   */
  public async update(
    req: TypedRequest<UpdatePost, {}, PostParams>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { userId, username } = res.locals.user;
      const postId = new ObjectId(req.params.postId);
      const content = req.body.content;

      // add doc to posts collection
      // push post doc id to feeds doc
      let { isModified: postExists } = await this.postTransaction(
        userId,
        username,
        content,
        "update",
        postId
      );
      if (postExists === false) {
        return next(
          new HttpError(
            new Error(
              `This Post does not exist or ${username} is not the author`
            ),
            400
          )
        );
      }
      // fetch user followers
      // update many - pull and push post doc id to all followers feeds doc
      this.postBackgroundOps(userId, postId, "update").then((flag: boolean) =>
        console.log(flag)
      );
      return res.status(200).json({ message: "Updated", postId });
    } catch (err) {
      next(new HttpError(err));
    }
  }

  /**
   *  @description -> to delete a tweet
   */
  public async delete(
    req: TypedRequest<{}, {}, PostParams>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { userId, username } = res.locals.user;
      const postId = new ObjectId(req.params.postId);

      // add doc to posts collection
      // push post doc id to feeds doc
      let { isModified: postExists } = await this.postTransaction(
        userId,
        username,
        "",
        "delete",
        postId
      );
      // fetch user followers
      // update many - pull and push post doc id to all followers feeds doc
      if (postExists === false) {
        return next(
          new HttpError(
            new Error(
              `This Post does not exist or ${username} is not the author`
            ),
            400
          )
        );
      }
      this.postBackgroundOps(userId, postId, "delete").then((flag: boolean) =>
        console.log(flag)
      );

      return res.status(200).json({ message: "Deleted", postId });
    } catch (err) {
      next(new HttpError(err));
    }
  }
}

export default new PostController();
