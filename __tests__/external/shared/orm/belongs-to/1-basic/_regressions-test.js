import { Server, Model, belongsTo } from "miragejs";

describe("External | Shared | ORM | Belongs To | Basic | regressions", function () {
  test("belongsTo accessors works when foreign key is present but falsy", () => {
    let server = new Server({
      environment: "test",
      models: {
        author: Model.extend(),
        post: Model.extend({
          author: belongsTo(),
        }),
      },
    });

    server.db.loadData({
      posts: [{ id: 1, authorId: 0, name: "some post" }],
      authors: [{ id: 0, name: "Foo" }],
    });

    let post = server.schema.posts.find(1);
    expect(post.author.name).toBe("Foo");
  });
});
