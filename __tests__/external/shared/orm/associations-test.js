import { Server, Model, hasMany, belongsTo } from "miragejs";

describe("External | Shared | ORM | associations", function () {
  let server;
  let fineAuthorAssociation;
  let commentsAssociation;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        user: Model,
        post: Model.extend({
          fineAuthor: belongsTo("user"),
          comments: hasMany(),
        }),
        comment: Model,
      },
    });
    let associations = server.schema.associationsFor("post");
    fineAuthorAssociation = associations.fineAuthor;
    commentsAssociation = associations.comments;
  });

  afterEach(() => {
    server.shutdown();
  });

  test("name returns the property used to define the association", function () {
    expect(fineAuthorAssociation.name).toBe("fineAuthor");
    expect(commentsAssociation.name).toBe("comments");
  });

  test("modelName returns the modelName of the associated model", function () {
    expect(fineAuthorAssociation.modelName).toBe("user");
    expect(commentsAssociation.modelName).toBe("comment");
  });

  test("type returns the type of association", function () {
    expect(fineAuthorAssociation.type).toBe("belongsTo");
    expect(commentsAssociation.type).toBe("hasMany");
  });

  test("foreignKey returns the name used for the association's foreign key", function () {
    expect(fineAuthorAssociation.foreignKey).toBe("fineAuthorId");
    expect(commentsAssociation.foreignKey).toBe("commentIds");
  });
});
