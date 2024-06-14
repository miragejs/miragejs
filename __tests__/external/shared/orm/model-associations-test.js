import { Server, Model, belongsTo, hasMany } from "miragejs";

describe("External | Shared | ORM | Model | associations", () => {
  let server;
  let post;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        user: Model,
        post: Model.extend({
          user: belongsTo(),
          comments: hasMany(),
        }),
        comment: Model,
      },
    });

    let peter = server.create("user", { name: "Peter" });
    post = server.create("post", { user: peter });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("associations returns a hashmap of the model's associations", function () {
    let postAssociations = post.associations;

    expect(Object.keys(postAssociations)).toEqual(["user", "comments"]);
    expect(postAssociations.user.name).toBe("user");
    expect(postAssociations.user.modelName).toBe("user");
    expect(postAssociations.user.type).toBe("belongsTo");
    expect(postAssociations.comments.name).toBe("comments");
    expect(postAssociations.comments.modelName).toBe("comment");
    expect(postAssociations.comments.type).toBe("hasMany");
  });
});
