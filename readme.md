# Twitter Service

## Using Node.js + MongoDB

This Project provides users to register, login, create and manage their tweets.

## Database Schema

### Users

```sh
UserDoc {
       _id: ObjectId;
       username: string;
       password: string;
       lastName?: string;
       firstName?: string;
       ip: string;
       followers: ObjectId[];
       following: ObjectId[];
}
```

### Posts

```sh
PostDoc {
       _id: ObjectId;
       author_id: ObjectId;
       username: string;
       content: string;
       created_at: number;
       updated_at: number;
}
```

### Feeds

Here \_id is same as user.\_id, So on each user creation, we will create feeds document with \_id as user.\_id

```sh
FeedDoc {
        _id: ObjectId;
        feeds: ObjectId[];
        length: number;
}
```

## APIs

### [POST] Register User

### [POST] Login User

### [POST] Follow User

### [POST] UnFollow User

### [POST] Add Tweet

### [PATCH] Update Tweet

### [DELETE] Delete Tweet

### [GET] User Feed

## Design Overview

Since this application falls under high read use case, I opted to go with fan out on write approach, which is to compute the user feed when ever there is a write operation on user tweets, with this approach the read latency is very less, therefore user experience is good.

When a user makes a tweet, first we add that to posts collection and push the postId onto the user feeds array and increment length, next asynchronously we fetch all the followers and push the postId onto the followers feeds array and increment length. The concept is same for Update Tweet and Delete Tweet with little bit of logic changes.

When user makes a request to see his/her feed, we simply fetch the last elements of feeds array of that particular user and join that with posts collection to fetch all the details, with this approach the read latency is lower.

## Requirements

For development, you will need Node.js, npm installed in your environment and mongodb free cloud account.

    $ node --version
    v20.10.0.

    $ npm --version
    8.11.0

    $ mongodb --version
    6.0.12

---

## Install

    $ git clone https://github.com/tars47/twitter-service
    $ cd twitter-service

## Configure app

Open `/.env` replace MONGODB_URL with you mongodb url string

## Configure mongodb

Create twitter database and users collection
Next create an index on username field

```sh
{
 "username": 1
}
```

## Running the project

    $ npm i
    $ npm run start

## Testing With Postman

Download Twitter-Service.postman_collection file and import it

Download Twitter-Service.postman_environment file and import it

Register a user and Login, up on login, Auth, UserID and UserName environment
variables will be auto populated.
