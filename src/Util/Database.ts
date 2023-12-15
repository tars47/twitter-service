import { MongoClient, type Collection } from "mongodb";
import { UserDoc } from "../Controllers/Types/User";
import { PostDoc } from "../Controllers/Types/Post";
import { FeedDoc } from "../Controllers/Types/Feed";

const client = new MongoClient(process.env.MONGODB_URL as string);

let users: Collection<UserDoc>;
let posts: Collection<PostDoc>;
let feeds: Collection<FeedDoc>;

async function connectToDatabase() {
  await client.connect();

  users = client.db(process.env.MONGOGDB_DATABASE_NAME).collection("users");
  posts = client.db(process.env.MONGOGDB_DATABASE_NAME).collection("posts");
  feeds = client.db(process.env.MONGOGDB_DATABASE_NAME).collection("feeds");

  console.log("Connected successfully to server");
  return "done.";
}

export { connectToDatabase, users, posts, feeds, client };
