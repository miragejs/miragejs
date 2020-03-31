import { Server, JSONAPISerializer, Model, belongsTo, hasMany } from "miragejs";

describe("Integration | Server | Shorthands | Post with relationships", function () {
  let newServerWithSchema, server;

  beforeEach(function () {
    newServerWithSchema = function (schema) {
      server = new Server({
        environment: "development",
        models: schema,
        serializers: {
          appliction: JSONAPISerializer,
        },
      });
      server.timing = 0;
      server.logging = false;

      return server;
    };
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it works for belongs to", async () => {
    let server = newServerWithSchema({
      author: Model.extend({
        posts: hasMany(),
      }),
      post: Model.extend({
        author: belongsTo(),
      }),
    });
    server.post("/posts");

    expect(server.db.posts).toHaveLength(0);

    let author = server.create("author");

    let res = await fetch("/posts", {
      method: "POST",
      body: JSON.stringify({
        data: {
          attributes: {
            title: "Post 1",
          },
          relationships: {
            author: {
              data: {
                type: "authors",
                id: author.id,
              },
            },
          },
        },
      }),
    });
    let data = await res.json();

    let postId = data.post.id;
    let post = server.schema.posts.find(postId);

    expect(post).toBeTruthy();
    expect(post.author.id).toEqual(author.id);
  });

  test("it works for belongs to polymorphic", async () => {
    let server = newServerWithSchema({
      video: Model.extend(),
      post: Model.extend(),
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true }),
      }),
    });
    server.post("/comments");

    expect(server.db.comments).toHaveLength(0);

    let video = server.create("video");

    let res = await fetch("/comments", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "comments",
          attributes: {
            text: "Comment 1",
          },
          relationships: {
            commentable: {
              data: {
                type: "videos",
                id: video.id,
              },
            },
          },
        },
      }),
    });
    let data = await res.json();

    let commentId = data.comment.id;
    let comment = server.schema.comments.find(commentId);

    expect(comment).toBeTruthy();
    expect(comment.commentable.equals(video)).toBeTruthy();
  });

  test("it works for has many polymorphic", async () => {
    let server = newServerWithSchema({
      car: Model.extend(),
      watch: Model.extend(),
      user: Model.extend({
        collectibles: hasMany({ polymorphic: true }),
      }),
    });

    server.post("/users");

    expect(server.db.users).toHaveLength(0);

    let car = server.create("car");
    let watch = server.create("watch");

    let res = await fetch("/users", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "users",
          attributes: {
            name: "Elon Musk",
          },
          relationships: {
            collectibles: {
              data: [
                {
                  type: "cars",
                  id: car.id,
                },
                {
                  type: "watches",
                  id: watch.id,
                },
              ],
            },
          },
        },
      }),
    });

    let data = await res.json();

    let userId = data.user.id;
    let user = server.schema.users.find(userId);

    expect(user).toBeTruthy();
    expect(user.collectibles.includes(car)).toBeTruthy();
    expect(user.collectibles.includes(watch)).toBeTruthy();
  });
});
