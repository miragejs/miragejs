
import { Model, hasMany, JSONAPISerializer } from "@miragejs/server";
import Server from "@lib/server";
import promiseAjax from "dummy/tests/helpers/promise-ajax";

describe("Integration | Server | Regressions | Many to many bug", function(
  
) {
  beforeEach(function() {
    this.server = new Server({
      environment: "test",
      models: {
        post: Model.extend({
          tags: hasMany()
        }),
        tag: Model.extend({
          posts: hasMany()
        })
      },
      serializers: {
        application: JSONAPISerializer
      },
      baseConfig() {
        this.resource("posts");
      }
    });
  });

  afterEach(function() {
    this.server.shutdown();
  });

  test("it works", async () => {
    expect.assertions(6);

    let serverTagA = this.server.create("tag", { name: "A", slug: "a" });
    let serverTagB = this.server.create("tag", { name: "B", slug: "b" });
    let serverPost = this.server.create("post", {
      title: "Post 1",
      tags: [serverTagA, serverTagB]
    });

    expect(serverTagA.postIds.length).toEqual(1);
    expect(serverTagB.postIds.length).toEqual(1);
    expect(serverPost.tagIds).toEqual(["1", "2"]);

    await promiseAjax({
      method: "PATCH",
      url: "/posts/1",
      data: JSON.stringify({
        data: {
          id: "1",
          attributes: {
            title: "Post 2"
          },
          relationships: {
            tags: {
              data: [
                {
                  type: "tags",
                  id: "2"
                }
              ]
            }
          },
          type: "posts"
        }
      })
    });

    serverTagA.reload();
    serverTagB.reload();
    serverPost.reload();

    expect(serverTagA.postIds).toEqual([]);
    expect(serverTagB.postIds).toEqual(["1"]);
    expect(serverPost.tagIds).toEqual(["2"]);
  });
});
