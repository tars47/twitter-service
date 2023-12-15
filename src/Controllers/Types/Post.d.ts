import { ObjectId, Timestamp } from "mongodb";

export interface PostDoc {
  author_id: ObjectId;
  username: string;
  content: string;
  created_at: number;
  updated_at: number;
}

export interface AddPost {
  content: string;
}

export interface UpdatePost {
  content: string;
}

export interface PostParams {
  postId: ObjectId;
}
