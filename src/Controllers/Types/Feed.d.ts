import { ObjectId } from "mongodb";

export interface FeedDoc {
  feeds: ObjectId[];
  length: number;
}

export interface FeedRequest {
  from: string;
  to: string;
}
