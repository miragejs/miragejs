import { Server, JSONAPISerializer, Model, belongsTo, hasMany } from "miragejs";

describe("Integration | Server | Shorthands | Patch with relationships", function () {
  let newServerWithSchema, server;

  beforeEach(function () {
    newServerWithSchema = function (schema) {
      server = new Server({
        environment: "development",
        models: schema,
        serializers: {
          application: JSONAPISerializer,
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

  test("it can null out belongs to relationships", async () => {
    let server = newServerWithSchema({
      author: Model.extend({
        posts: hasMany(),
      }),
      post: Model.extend({
        author: belongsTo(),
      }),
    });

    server.patch("/posts/:id");

    let author = server.create("author");
    let post = server.create("post", { author });

    await fetch(`/posts/${post.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          attributes: {
            title: "Post 1",
          },
          relationships: {
            author: {
              data: null,
            },
          },
        },
      }),
    });

    post.reload();
    expect(post.author).toBeNull();
  });

  test("it can null out belongs to polymorphic relationships", async () => {
    let server = newServerWithSchema({
      video: Model.extend(),
      post: Model.extend(),
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true }),
      }),
    });
    server.patch("/comments/:id");

    let video = server.create("video");
    let comment = server.create("comment", {
      commentable: video,
    });

    await fetch(`/comments/${comment.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          attributes: {
            title: "Post 1",
          },
          relationships: {
            commentable: {
              data: null,
            },
          },
        },
      }),
    });

    comment.reload();
    expect(comment.commentable).toBeNull();
  });

  test("it can null out has many polymorphic relationships", async () => {
    let server = newServerWithSchema({
      car: Model.extend(),
      watch: Model.extend(),
      user: Model.extend({
        collectibles: hasMany({ polymorphic: true }),
      }),
    });
    server.patch("/users/:id");

    let car = server.create("car");
    let watch = server.create("watch");
    let user = server.create("user", {
      collectibles: [car, watch],
    });

    await fetch(`/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          attributes: {},
          relationships: {
            collectibles: {
              data: null,
            },
          },
        },
      }),
    });

    user.reload();
    expect(user.collectibles).toHaveLength(0);
  });

  test("it camelizes relationship names", async () => {
    let server = newServerWithSchema({
      postAuthor: Model.extend({
        posts: hasMany(),
      }),
      post: Model.extend({
        postAuthor: belongsTo(),
      }),
    });

    server.patch("/posts/:id");

    let postAuthor = server.create("post-author");
    let post = server.create("post");

    await fetch(`/posts/${post.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          attributes: {},
          relationships: {
            "post-author": {
              data: {
                id: postAuthor.id,
                type: "post-authors",
              },
            },
          },
        },
      }),
    });

    post.reload();
    expect(post.postAuthorId).toEqual(postAuthor.id);
  });
});
