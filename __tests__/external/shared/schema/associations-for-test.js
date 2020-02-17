import { Server, Model, hasMany, belongsTo } from "miragejs";

describe("External | Shared | Schema | associationsFor", function() {
  let server;

  beforeEach(() => {
    server = new Server({ environment: "test" });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it returns an empty object for a model with no relationships", () => {
    server.config({
      models: {
        user: Model
      }
    });

    expect(server.schema.associationsFor("user")).toEqual({});
  });

  test("it works for belongsTo and hasMany relationships", () => {
    server.config({
      models: {
        user: Model,
        article: Model.extend({
          fineAuthor: belongsTo("user"),
          comments: hasMany()
        }),
        comment: Model
      }
    });

    let associations = server.schema.associationsFor("article");

    expect(Object.keys(associations)).toEqual(["fineAuthor", "comments"]);

    let fineAuthorAssociation = associations.fineAuthor;
    expect(fineAuthorAssociation.constructor.name).toEqual("BelongsTo");
    expect(fineAuthorAssociation.modelName).toEqual("user");
    expect(fineAuthorAssociation.key).toEqual("fineAuthor");

    let commentsAssociation = associations.comments;
    expect(commentsAssociation.constructor.name).toEqual("HasMany");
    expect(commentsAssociation.modelName).toEqual("comment");
    expect(commentsAssociation.key).toEqual("comments");
  });
});
