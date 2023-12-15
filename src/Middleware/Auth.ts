import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { HttpError } from "../Util/HttpError";
import { type DecodedUserPayload } from "../Controllers/Types/User";
import { ObjectId } from "mongodb";

export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    !req.headers.authorization ||
    typeof req.headers.authorization !== "string"
  ) {
    return next(new HttpError("Authorization token is required", 401));
  }

  const authSplit = req.headers.authorization.split(" ");

  if (authSplit.length < 2 || authSplit[0] !== "Bearer" || !authSplit[1]) {
    return next(new HttpError("Invalid Authorization token format", 401));
  }

  const token = authSplit[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedUserPayload;

    res.locals.user = {};
    res.locals.user.userId = new ObjectId(decoded.data.userId);
    res.locals.user.username = decoded.data.username;

    if (req.params?.userId && req.params.userId != res.locals.user.userId) {
      return next(
        new HttpError(
          "Auth token does not belong to the user id present in the url params",
          401
        )
      );
    }

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(new HttpError("Auth Token Expired", 401));
    } else {
      return next(
        new HttpError({
          message: "Auth Token Unknown Error",
          detail: err.message || "",
        })
      );
    }
  }
}
