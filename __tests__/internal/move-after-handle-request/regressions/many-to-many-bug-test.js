import { Server, Model, hasMany, JSONAPISerializer } from "miragejs";

describe("Integration | Server | Regressions | Many to many bug", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        post: Model.extend({
          tags: hasMany(),
        }),
        tag: Model.extend({
          posts: hasMany(),
        }),
      },
      serializers: {
        application: JSONAPISerializer,
      },
      routes() {
        this.resource("posts");
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it works", async () => {
    expect.assertions(6);

    let serverTagA = server.create("tag", { name: "A", slug: "a" });
    let serverTagB = server.create("tag", { name: "B", slug: "b" });
    let serverPost = server.create("post", {
      title: "Post 1",
      tags: [serverTagA, serverTagB],
    });

    expect(serverTagA.postIds).toHaveLength(1);
    expect(serverTagB.postIds).toHaveLength(1);
    expect(serverPost.tagIds).toEqual(["1", "2"]);

    await fetch("/posts/1", {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          id: "1",
          attributes: {
            title: "Post 2",
          },
          relationships: {
            tags: {
              data: [
                {
                  type: "tags",
                  id: "2",
                },
              ],
            },
          },
          type: "posts",
        },
      }),
    });

    serverTagA.reload();
    serverTagB.reload();
    serverPost.reload();

    expect(serverTagA.postIds).toEqual([]);
    expect(serverTagB.postIds).toEqual(["1"]);
    expect(serverPost.tagIds).toEqual(["2"]);
  });
});
