import { Server, Model, hasMany, belongsTo } from "miragejs";

describe("External | Shared | ORM | associationsFor", function () {
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
        user: Model,
      },
    });

    expect(server.schema.associationsFor("user")).toEqual({});
  });

  test("it returns an object containing all a model's relationships", () => {
    server.config({
      models: {
        user: Model,
        article: Model.extend({
          fineAuthor: belongsTo("user"),
          comments: hasMany(),
        }),
        comment: Model,
      },
    });

    let associations = server.schema.associationsFor("article");

    expect(Object.keys(associations)).toEqual(["fineAuthor", "comments"]);

    let fineAuthorAssociation = associations.fineAuthor;

    expect(fineAuthorAssociation.type).toBe("belongsTo");
    expect(fineAuthorAssociation.modelName).toBe("user");
    expect(fineAuthorAssociation.name).toBe("fineAuthor");

    let commentsAssociation = associations.comments;
    expect(commentsAssociation.type).toBe("hasMany");
    expect(commentsAssociation.modelName).toBe("comment");
    expect(commentsAssociation.name).toBe("comments");
  });
});
