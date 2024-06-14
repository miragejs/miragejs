import { Server, Model, JSONAPISerializer } from "miragejs";
import PostShorthandRouteHandler from "@lib/route-handlers/shorthands/post";

describe("Integration | Route Handlers | POST shorthand", () => {
  let server, schema, serializer, body;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        author: Model.extend({}),
      },
    });
    server.timing = 0;
    server.logging = false;

    schema = server.schema;
    serializer = new JSONAPISerializer();

    body = {
      data: {
        type: "authors",
        attributes: {
          "first-name": "Ganon",
          "last-name": "Dorf",
        },
      },
    };
  });

  afterEach(() => {
    server.shutdown();
  });

  test("string shorthand creates a record of the specified type and returns the new model", () => {
    let request = { requestBody: JSON.stringify(body), url: "/people" };
    let handler = new PostShorthandRouteHandler(schema, serializer, "author");

    let model = handler.handle(request);

    expect(schema.db.authors).toHaveLength(1);
    expect(model instanceof Model).toBeTruthy();
    expect(model.modelName).toBe("author");
    expect(model.firstName).toBe("Ganon");
  });

  test("query params are ignored", () => {
    let request = {
      requestBody: JSON.stringify(body),
      url: "/authors?foo=bar",
      queryParams: { foo: "bar" },
    };
    let handler = new PostShorthandRouteHandler(schema, serializer, "author");

    let model = handler.handle(request);

    expect(schema.db.authors).toHaveLength(1);
    expect(model instanceof Model).toBeTruthy();
    expect(model.modelName).toBe("author");
    expect(model.firstName).toBe("Ganon");
  });

  test("undefined shorthand creates a record and returns the new model", () => {
    let request = { requestBody: JSON.stringify(body), url: "/authors" };
    let handler = new PostShorthandRouteHandler(
      schema,
      serializer,
      null,
      "/authors"
    );

    let model = handler.handle(request);

    expect(schema.db.authors).toHaveLength(1);
    expect(model instanceof Model).toBeTruthy();
    expect(model.modelName).toBe("author");
    expect(model.firstName).toBe("Ganon");
  });

  test("if a shorthand tries to access an unknown type it throws an error", () => {
    let request = { requestBody: JSON.stringify(body), url: "/foobars" };
    let handler = new PostShorthandRouteHandler(schema, serializer, "foobar");

    expect(function () {
      handler.handle(request);
    }).toThrow();
    expect(true).toBeTruthy();
  });
});
