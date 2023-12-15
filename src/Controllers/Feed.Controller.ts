import { ObjectId } from "mongodb";
import { HttpError } from "../Util/HttpError";
import { type TypedRequest } from "./Types/Request";
import { type Response, type NextFunction } from "express";
import { feeds, posts } from "../Util/Database";
import { type FeedRequest } from "./Types/Feed";
import { type PostDoc } from "./Types/Post";
/**
 *  @description -> This controller class implements all the handlers for /feed subroute
 */
class FeedController {
  /**
   *  @description -> to fetch precomputed user feeds
   */
  public async list(
    req: TypedRequest<{}, FeedRequest>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const userId = res.locals.user.userId;
      const from = Number(req.query.from);
      const to = Number(req.query.to);

      if (from >= to || to - from > 100) {
        return next(
          new HttpError(
            "From should be less than To and the difference cannot be greater than 100",
            400
          )
        );
      }

      const aggregationPipeline = [
        {
          $match: { _id: userId },
        },
        {
          $addFields: {
            feedsLength: "$length",
          },
        },
        {
          $project: {
            feeds: {
              $cond: {
                if: { $lte: [to, "$feedsLength"] },
                then: { $slice: ["$feeds", -to, to - from] },
                else: {
                  $cond: {
                    if: { $lt: [from, "$feedsLength"] },
                    then: {
                      $slice: [
                        "$feeds",
                        0,
                        { $subtract: ["$feedsLength", from] },
                      ],
                    },
                    else: [],
                  },
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "feeds",
            foreignField: "_id",
            as: "posts",
          },
        },
        {
          $project: {
            posts: 1,
          },
        },
      ];

      const result = await feeds.aggregate(aggregationPipeline).toArray();

      if (result.length === 0 || !result[0]) {
        return next(new HttpError(new Error("User feeds not found")));
      }

      const postsArray = result[0].posts
        .sort((p1: any, p2: any) => {
          let a = p1.updated_at === -1 ? p1.created_at : p1.updated_at;
          let b = p2.updated_at === -1 ? p2.created_at : p2.updated_at;

          return b - a;
        })
        .map((post: any) => {
          post.postId = post._id;
          post.authorId = post.author_id;
          post.createdAt = new Date(post.created_at).toISOString();
          if (post.updated_at !== -1) {
            post.updatedAt = new Date(post.updated_at).toISOString();
          }
          delete post._id;
          delete post.author_id;
          delete post.created_at;
          delete post.updated_at;
          return post;
        });

      return res.status(200).json({ status: "Success", feeds: postsArray });
    } catch (err) {
      next(new HttpError(err));
    }
  }
}

export default new FeedController();
