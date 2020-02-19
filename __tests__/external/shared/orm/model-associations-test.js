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
          comments: hasMany()
        }),
        comment: Model
      }
    });

    let peter = server.create("user", { name: "Peter" });
    post = server.create("post", { user: peter });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("associations returns a hashmap of the model's associations", function() {
    let postAssociations = post.associations;

    expect(Object.keys(postAssociations)).toEqual(["user", "comments"]);
    expect(postAssociations.user.name).toEqual("user");
    expect(postAssociations.user.modelName).toEqual("user");
    expect(postAssociations.user.type).toEqual("belongsTo");
    expect(postAssociations.comments.name).toEqual("comments");
    expect(postAssociations.comments.modelName).toEqual("comment");
    expect(postAssociations.comments.type).toEqual("hasMany");
  });
});
