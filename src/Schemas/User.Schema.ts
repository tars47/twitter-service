import { type JSONSchemaType } from "ajv";
import {
  type RegisterUser,
  type LoginRequest,
  type FollowUnFollowUser,
} from "../Controllers/Types/User";

function nullable<T>(inp: T): T & { nullable: true } {
  return inp as T & { nullable: true };
}

/**
 *  @description -> JSON Schema for validating user/register request body data
 */
export const register: JSONSchemaType<RegisterUser> = {
  type: "object",
  properties: {
    password: { type: "string", minLength: 1, maxLength: 100 },
    username: { type: "string", minLength: 1, maxLength: 100 },
    lastName: nullable({ type: "string", minLength: 1, maxLength: 100 }),
    firstName: nullable({ type: "string", minLength: 1, maxLength: 100 }),
  },
  required: ["password", "username"],
  additionalProperties: false,
};

/**
 *  @description -> JSON Schema for validating user/login request body data
 */
export const login: JSONSchemaType<LoginRequest> = {
  type: "object",
  properties: {
    password: { type: "string", minLength: 1, maxLength: 100 },
    username: { type: "string", minLength: 1, maxLength: 100 },
  },
  required: ["password", "username"],
  additionalProperties: false,
};

/**
 *  @description -> JSON Schema for validating user/follow request body data
 */
export const follow: JSONSchemaType<FollowUnFollowUser> = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 1 },
  },
  required: ["username"],
  additionalProperties: false,
};

/**
 *  @description -> JSON Schema for validating user/unfollow request body data
 */
export const unfollow: JSONSchemaType<FollowUnFollowUser> = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 1 },
  },
  required: ["username"],
  additionalProperties: false,
};
