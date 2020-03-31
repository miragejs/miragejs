import { Server, Model, hasMany } from "miragejs";
import DeleteShorthandRouteHandler from "@lib/route-handlers/shorthands/delete";
import JSONAPISerializer from "@lib/serializers/json-api-serializer";

describe("Integration | Route Handlers | DELETE shorthand", () => {
  let server, schema, serializer;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        wordSmith: Model.extend({
          blogPosts: hasMany(),
        }),
        blogPost: Model,
      },
    });
    server.timing = 0;
    server.logging = false;

    let wordSmiths = [{ id: 1, name: "Ganon", blogPostIds: [1] }];
    let blogPosts = [
      { id: 1, title: "Lorem", wordSmithId: "1" },
      { id: 2, title: "Another", wordSmithId: "2" },
    ];
    server.db.loadData({ wordSmiths, blogPosts });

    schema = server.schema;
    serializer = new JSONAPISerializer();
  });

  afterEach(() => {
    server.shutdown();
  });

  test("undefined shorthand deletes the record and returns null", () => {
    let request = { url: "/word-smiths/1", params: { id: "1" } };
    let handler = new DeleteShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/word-smiths/:id"
    );

    let response = handler.handle(request);

    expect(schema.db.wordSmiths).toHaveLength(0);
    expect(response).toBeNil();
  });

  test("query params are ignored", () => {
    let request = {
      url: "/word-smiths/1?foo=bar",
      params: { id: "1" },
      queryParams: { foo: "bar" },
    };
    let handler = new DeleteShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/word-smiths/:id"
    );

    let response = handler.handle(request);

    expect(schema.db.wordSmiths).toHaveLength(0);
    expect(response).toBeNil();
  });

  test("string shorthand deletes the record of the specified type", () => {
    let request = {
      url: "/word-smiths/1?foo=bar",
      params: { id: "1" },
      queryParams: { foo: "bar" },
    };
    let handler = new DeleteShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/word-smiths/:id"
    );

    let response = handler.handle(request);

    expect(schema.db.wordSmiths).toHaveLength(0);
    expect(response).toBeNil();
  });

  test("array shorthand deletes the record and all related records", () => {
    let request = { url: "/word-smiths/1", params: { id: "1" } };
    let handler = new DeleteShorthandRouteHandler(schema, serializer, [
      "word-smith",
      "blog-posts",
    ]);

    let response = handler.handle(request);

    expect(schema.db.wordSmiths).toHaveLength(0);
    expect(schema.db.blogPosts).toHaveLength(1);
    expect(response).toBeNil();
  });

  test("if a shorthand tries to access an unknown type it throws an error", () => {
    let request = { url: "/foobars/1", params: { id: "1" } };
    let handler = new DeleteShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/foobars/:id"
    );

    expect(function () {
      handler.handle(request);
    }).toThrow();
    expect(true).toBeTruthy();
  });
});
