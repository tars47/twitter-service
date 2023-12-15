import { type JSONSchemaType } from "ajv";
import { type FeedRequest } from "../Controllers/Types/Feed";

// /**
//  *  @description -> JSON Schema for validating GET /feed request query data
//  */
export const getFeed: JSONSchemaType<FeedRequest> = {
  type: "object",
  properties: {
    from: { type: "string", minLength: 1 },
    to: { type: "string", minLength: 1 },
  },
  required: ["from", "to"],
  additionalProperties: false,
};
