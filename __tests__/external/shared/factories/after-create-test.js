import { Model, Factory, belongsTo, Server } from "miragejs";

describe("External | Shared | Factories | afterCreate", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        author: Model,
        post: Model.extend({
          author: belongsTo(),
        }),
        comment: Model.extend({
          post: belongsTo(),
        }),
      },
      factories: {
        author: Factory.extend({
          afterCreate(author, server) {
            author.update({ name: "Sam" });
            server.create("post", { author });
          },
        }),
        post: Factory.extend({
          title: "Lorem ipsum",
          afterCreate(post, server) {
            server.create("comment", { post });
          },
        }),
        comment: Factory.extend({
          text: "Yo soy el nino",
        }),
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it works for models", () => {
    let author = server.create("author");

    expect(author.name).toBe("Sam");
    expect(server.db.posts).toHaveLength(1);
    expect(server.db.posts[0]).toEqual({
      id: "1",
      title: "Lorem ipsum",
      authorId: "1",
    });
    expect(server.db.comments).toHaveLength(1);
    expect(server.db.comments[0]).toEqual({
      id: "1",
      text: "Yo soy el nino",
      postId: "1",
    });
  });
});
