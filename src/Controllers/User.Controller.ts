import jwt from "jsonwebtoken";
import { HttpError } from "../Util/HttpError";
import { type TypedRequest } from "./Types/Request";
import { type Response, type NextFunction } from "express";
import {
  type RegisterUser,
  type LoginRequest,
  type UniqueUser,
  type FollowUnFollowUser,
} from "./Types/User";
import { users, feeds, client } from "../Util/Database";
import Password from "../Util/Password";
import { ObjectId } from "mongodb";
/**
 *  @description -> This controller class implements all the handlers for /user subroutes
 */
class UserController {
  /**
   *  @description -> utility function to return signed jwt with user payload
   */
  private signJwt(user: UniqueUser) {
    return jwt.sign(
      {
        data: user,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
  }

  /**
   *  @description -> utility function to query user coll in mongodb
   */
  private async findUser(
    username: string,
    projectPassword: boolean = false,
    projectFollowers: boolean | ObjectId = false
  ) {
    try {
      let projection: any = {
        projection: {
          username: 1,
          _id: 1,
        },
      };

      if (projectFollowers) {
        projection = {
          projection: {
            followers: {
              $elemMatch: { $eq: projectFollowers },
            },
            username: 1,
            _id: 1,
          },
        };
      }
      if (projectPassword) {
        projection = { projection: { username: 1, password: 1, _id: 1 } };
      }

      const user = await users.findOne(
        {
          username: username,
        },
        projection
      );

      return user;
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  /**
   *  @description -> utility function to handle signup ops for user coll in mongodb
   */
  private async registerTransaction(req: TypedRequest<RegisterUser>) {
    const session = client.startSession();
    try {
      session.startTransaction();

      const { insertedId } = await users.insertOne({
        ...req.body,
        ip: req.ip || "",
        followers: [],
        following: [],
      });

      await feeds.insertOne({
        _id: insertedId,
        feeds: [],
        length: 0,
      });

      await session.commitTransaction();
      return insertedId;
    } catch (error) {
      console.log("An error occurred during the transaction:" + error);
      await session.abortTransaction();
      return Promise.reject(error);
    } finally {
      await session.endSession();
    }
  }

  /**
   *  @description -> registers the user
   */
  public async register(
    req: TypedRequest<RegisterUser>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const user = await this.findUser(req.body.username);

      if (user) {
        return next(
          new HttpError(new Error("Username provided already exists"), 409)
        );
      }
      req.body.password = await Password.hash(req.body.password);

      const userId = await this.registerTransaction(req);
      const savedUser: UniqueUser = { userId, username: req.body.username };
      const token = this.signJwt(savedUser);

      return res
        .status(201)
        .json({ status: "Created", user: savedUser, token });
    } catch (err) {
      return next(new HttpError(err));
    }
  }

  /**
   *  @description -> to login the user
   */
  public async login(
    req: TypedRequest<LoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const user = await this.findUser(req.body.username, true);
      if (!user) {
        return next(new HttpError(new Error("Username does not exists"), 401));
      }

      const isValidPassword = await Password.compare(
        req.body.password,
        user.password
      );
      if (!isValidPassword) {
        return next(new HttpError(new Error("Incorrect password"), 401));
      }

      const savedUser: UniqueUser = {
        username: user.username,
        userId: user._id,
      };
      const token = this.signJwt(savedUser);

      return res
        .status(200)
        .json({ status: "Success", user: savedUser, token });
    } catch (err) {
      next(new HttpError(err));
    }
  }

  /**
   *  @description -> utility function to handle follow/unfollow ops in mongodb
   */
  private async followOrUnfollow(
    follower: ObjectId,
    following: ObjectId,
    type: "follow" | "unfollow"
  ) {
    const session = client.startSession();
    try {
      session.startTransaction();
      let operation = type === "follow" ? `$push` : "$pull";

      await users.updateOne(
        { _id: follower },
        { [operation]: { following: following } },
        { session }
      );

      await users.updateOne(
        { _id: following },
        { [operation]: { followers: follower } },
        { session }
      );

      await session.commitTransaction();
      console.log("Transaction committed.");
    } catch (error) {
      console.log("An error occurred during the transaction:" + error);
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }

  /**
   *  @description -> to follow an user
   */
  public async follow(
    req: TypedRequest<FollowUnFollowUser>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { userId: curUserId, username: curUsername } = res.locals.user;
      const user = await this.findUser(req.body.username, false, curUserId);

      if (!user) {
        return next(new HttpError(new Error("Username does not exists"), 401));
      } else if (user._id.equals(curUserId)) {
        return next(
          new HttpError(new Error("User can not follow himself"), 400)
        );
      } else if (user.followers) {
        return next(
          new HttpError(
            new Error(`${curUsername} is already following ${user.username}`),
            400
          )
        );
      }

      await this.followOrUnfollow(res.locals.user.userId, user._id, "follow");
      return res.status(200).json({ status: "Success" });
    } catch (err) {
      next(new HttpError(err));
    }
  }

  /**
   *  @description -> to unfollow an user
   */
  public async unfollow(
    req: TypedRequest<FollowUnFollowUser>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { userId: curUserId, username: curUsername } = res.locals.user;
      const user = await this.findUser(req.body.username, false, curUserId);
      if (!user) {
        return next(new HttpError(new Error("Username does not exists"), 401));
      } else if (user._id === res.locals.user.userId) {
        return next(
          new HttpError(new Error("User can not unfollow himself"), 400)
        );
      } else if (!user.followers) {
        return next(
          new HttpError(
            new Error(
              `${curUsername} is not currently following ${user.username}`
            ),
            400
          )
        );
      }
      await this.followOrUnfollow(res.locals.user.userId, user._id, "unfollow");
      return res.status(200).json({ status: "Success" });
    } catch (err) {
      next(new HttpError(err));
    }
  }
}

export default new UserController();
