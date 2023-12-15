import { type JSONSchemaType } from "ajv";
import { type AddPost, type UpdatePost } from "../Controllers/Types/Post";

/**
 *  @description -> JSON Schema for validating POST /post request body data
 */
export const addPost: JSONSchemaType<AddPost> = {
  type: "object",
  properties: {
    content: { type: "string", minLength: 1 },
  },
  required: ["content"],
  additionalProperties: false,
};

/**
 *  @description -> JSON Schema for validating PATCH /post/:postId request body data
 */
export const updatePost: JSONSchemaType<UpdatePost> = {
  type: "object",
  properties: {
    content: { type: "string", minLength: 1 },
  },
  required: ["content"],
  additionalProperties: false,
};
