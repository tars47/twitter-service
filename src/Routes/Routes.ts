import { Router } from "express";
import Authenticate from "../Middleware/Auth";
import Validate from "../Middleware/Validation";
import user from "../Controllers/User.Controller";
import post from "../Controllers/Post.Controller";
import feed from "../Controllers/Feed.Controller";

/**
 *  @description ->  This class implements all the routes for twitter service
 */
class Routes {
  public path = "/user";
  public router = Router();

  public constructor() {
    this.mountRoutes();
  }

  /**
   * @description ->  this method registers all the routes
   */
  //prettier-ignore
  private mountRoutes(): void {
   
    //user signup/login
    this.router.post(`/register`, Validate, user.register.bind(user));
    this.router.post(`/login`, Validate, user.login.bind(user));

    //user follow/unfollow
    this.router.post(`/:userId/follow`, Authenticate, Validate, user.follow.bind(user));
    this.router.post(`/:userId/unfollow`, Authenticate, Validate, user.unfollow.bind(user));

    //feed related
    this.router.get(`/:userId/feed`, Authenticate, Validate, feed.list.bind(feed));

    //post related
    this.router.post(`/:userId/post`, Authenticate, Validate, post.add.bind(post));
    this.router.patch(`/:userId/post/:postId`, Authenticate, Validate, post.update.bind(post));
    this.router.delete(`/:userId/post/:postId`, Authenticate, post.delete.bind(post));

  }
}

export default new Routes();
