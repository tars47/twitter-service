import { type Request, type Response } from "express";

export type TypedRequest<
  ReqBody = Record<string, unknown>,
  QueryString = Record<string, unknown>,
  Params = Record<string, unknown>
> = Request<
  Partial<Params>,
  any,
  ReqBody,
  Partial<QueryString>,
  Record<string, unknown>
>;
