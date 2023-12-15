import { type HttpErrorObject, HttpError } from "../Util/HttpError";
import { type Request, type Response, type NextFunction } from "express";

export default function error(
  err: HttpErrorObject | Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json(err.error);
  } else if (err instanceof Error) {
    return res
      .status(500)
      .json({ status: "InternalError", message: err.message });
  } else {
    console.log("here in err middleware ->", err);
    return res
      .status(500)
      .json({
        status: "UnknownInternalError",
        message: "Unknown Internal Error",
        detail: err,
      });
  }
}
