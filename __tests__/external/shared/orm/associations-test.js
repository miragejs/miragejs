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
    expect(fineAuthorAssociation.name).toEqual("fineAuthor");
    expect(commentsAssociation.name).toEqual("comments");
  });

  test("modelName returns the modelName of the associated model", function () {
    expect(fineAuthorAssociation.modelName).toEqual("user");
    expect(commentsAssociation.modelName).toEqual("comment");
  });

  test("type returns the type of association", function () {
    expect(fineAuthorAssociation.type).toEqual("belongsTo");
    expect(commentsAssociation.type).toEqual("hasMany");
  });

  test("foreignKey returns the name used for the association's foreign key", function () {
    expect(fineAuthorAssociation.foreignKey).toEqual("fineAuthorId");
    expect(commentsAssociation.foreignKey).toEqual("commentIds");
  });
});
