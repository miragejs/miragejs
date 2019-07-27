import { Server, Model, Factory } from "@miragejs/server";

describe("Integration | Server with ORM", () => {
  let server;
  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        blogPost: Model
      },
      factories: {
        blogPost: Factory
      }
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function() {
    server.shutdown();
  });

  test("a single blogPost db collection is made", () => {
    expect(server.db._collections).toHaveLength(1);
    expect(server.db._collections[0].name).toEqual("blogPosts");
  });

  test("create looks up the appropriate db collection", () => {
    server.create("blog-post");

    expect(server.db.blogPosts).toHaveLength(1);
  });
});
