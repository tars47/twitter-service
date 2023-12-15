import { ObjectId } from "mongodb";

export interface UserDoc {
  username: string;
  password: string;
  lastName?: string;
  firstName?: string;
  ip: string;
  followers: ObjectId[];
  following: ObjectId[];
}

export interface RegisterUser {
  password: string;
  username: string;
  lastName?: string;
  firstName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DecodedUserPayload {
  data: UniqueUser;
  iat: number;
  exp: number;
}

export interface UniqueUser {
  userId: ObjectId;
  username: string;
}

export interface FollowUnFollowUser {
  username: string;
}
