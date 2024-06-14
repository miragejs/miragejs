import { Server, Model, JSONAPISerializer } from "miragejs";
import PutShorthandRouteHandler from "@lib/route-handlers/shorthands/put";

describe("Integration | Route Handlers | PUT shorthand", () => {
  let server, authors, schema, serializer, body;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        author: Model.extend(),
      },
    });
    server.timing = 0;
    server.logging = false;

    authors = [{ id: 1, firstName: "Ganon" }];
    server.db.loadData({
      authors: authors,
    });

    schema = server.schema;
    serializer = new JSONAPISerializer();

    body = {
      data: {
        type: "authors",
        id: "1",
        attributes: {
          "first-name": "Ganondorf",
        },
      },
    };
  });

  afterEach(() => {
    server.shutdown();
  });

  test("undefined shorthand updates the record and returns the model", () => {
    let handler = new PutShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors/:id"
    );
    let request = {
      requestBody: JSON.stringify(body),
      url: "/authors/1",
      params: { id: "1" },
    };

    let model = handler.handle(request);

    expect(schema.db.authors).toHaveLength(1);
    expect(model instanceof Model).toBeTruthy();
    expect(model.modelName).toBe("author");
    expect(model.firstName).toBe("Ganondorf");
  });

  test("query params are ignored", () => {
    let handler = new PutShorthandRouteHandler(schema, serializer, "author");
    let request = {
      requestBody: JSON.stringify(body),
      url: "/authors/1?foo=bar",
      params: { id: "1" },
      queryParams: { foo: "bar" },
    };

    let model = handler.handle(request);

    expect(schema.db.authors).toHaveLength(1);
    expect(model instanceof Model).toBeTruthy();
    expect(model.modelName).toBe("author");
    expect(model.firstName).toBe("Ganondorf");
  });

  test("string shorthand updates the record of the specified type and returns the model", () => {
    let handler = new PutShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors/:id"
    );
    let request = {
      requestBody: JSON.stringify(body),
      url: "/authors/1",
      params: { id: "1" },
    };

    let model = handler.handle(request);

    expect(schema.db.authors).toHaveLength(1);
    expect(model instanceof Model).toBeTruthy();
    expect(model.modelName).toBe("author");
    expect(model.firstName).toBe("Ganondorf");
  });

  test("if a shorthand tries to access an unknown type it throws an error", () => {
    let handler = new PutShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/foobars/:id"
    );
    let request = {
      requestBody: JSON.stringify(body),
      url: "/foobars/1",
      params: { id: "1" },
    };

    expect(function () {
      handler.handle(request);
    }).toThrow();
    expect(true).toBeTruthy();
  });
});
