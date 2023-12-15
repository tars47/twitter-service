import Ajv from "ajv";
import { register, login, follow, unfollow } from "../Schemas/User.Schema";
import { addPost, updatePost } from "../Schemas/Post.Schema";
import { getFeed } from "../Schemas/Feed.Schema";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../Util/HttpError";

/**
 *  @description -> This class is used to validate the request body against the schema.
 */
class Validation extends Ajv {
  /**
   *  @description -> Creates an instance of Validation
   */
  constructor() {
    super({
      allErrors: true,
    });
  }

  /**
   *  @description -> This function is used to add user schemas
   */
  private addUserSchemas() {
    this.addSchema(register, "user/register");
    this.addSchema(login, "user/login");
    this.addSchema(follow, "user/:userId/follow");
    this.addSchema(unfollow, "user/:userId/unfollow");
    return this;
  }

  /**
   *  @description -> This function is used to add post schemas
   */
  private addPostSchemas() {
    this.addSchema(addPost, "user/:userId/post");
    this.addSchema(updatePost, "user/:userId/post/:postId");
    return this;
  }

  /**
   *  @description -> This function is used to add feed schemas
   */
  private addFeedSchemas() {
    this.addSchema(getFeed, "user/:userId/feed");
    return this;
  }

  /**
   *  @description -> Utility method that calls all route methods
   */
  public addAllSchemas() {
    this.addUserSchemas();
    this.addPostSchemas();
    this.addFeedSchemas();
    return this;
  }

  /**
   *  @description -> Middleware function that validates the request body against the schema.
   */
  public Validate(req: Request, res: Response, next: NextFunction): void {
    const subRoute = req.route.path;
    const httpMethod = req.method;
    const route = req.baseUrl.split("/")[1];
    const validate = this.getSchema(`${route}${subRoute}`);
    let data;
    switch (httpMethod) {
      case "GET":
      case "DELETE": {
        data = req.query;
        break;
      }
      case "PUT":
      case "POST":
      case "PATCH": {
        data = req.body;
        break;
      }
    }
    if (validate?.(data)) {
      next();
    } else {
      next(new HttpError(validate?.errors, 400));
    }
  }
}

const validation = new Validation().addAllSchemas();

export default function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  return validation.Validate(req, res, next);
}
