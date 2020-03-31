import { Server, Model, hasMany, belongsTo, JSONAPISerializer } from "miragejs";

describe("Integration | Server | Regressions | 1613 Two bidirectional many-to-many with same target model update bug", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        user: Model.extend({
          authoredPosts: hasMany("post", { inverse: "author" }),
          editedPosts: hasMany("post", { inverse: "editor" }),
        }),
        post: Model.extend({
          author: belongsTo("user", { inverse: "authoredPosts" }),
          editor: belongsTo("user", { inverse: "editedPosts" }),
        }),
      },
      serializers: {
        application: JSONAPISerializer.extend(),
        user: JSONAPISerializer.extend({
          alwaysIncludeLinkageData: true,
        }),
      },
      routes() {
        this.resource("posts");
        this.resource("users");
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it stores both relationships", async () => {
    let post = server.create("post");
    let user = server.create("user");

    expect.assertions(1);

    await fetch(`/posts/${post.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          id: post.id,
          attributes: {},
          relationships: {
            author: {
              data: {
                type: "users",
                id: user.id,
              },
            },
            editor: {
              data: {
                type: "users",
                id: user.id,
              },
            },
          },
          type: "posts",
        },
      }),
    });

    let res = await fetch(`/users/${user.id}`);
    let json = await res.json();

    expect(json.data).toEqual({
      attributes: {},
      id: "1",
      relationships: {
        "authored-posts": {
          data: [
            {
              id: "1",
              type: "posts",
            },
          ],
        },
        "edited-posts": {
          data: [
            {
              id: "1",
              type: "posts",
            },
          ],
        },
      },
      type: "users",
    });
  });
});
