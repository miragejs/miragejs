import { Server, Model, JSONAPISerializer, Response } from "miragejs";
import HeadShorthandRouteHandler from "@lib/route-handlers/shorthands/head";

describe("Integration | Route Handlers | HEAD shorthand", () => {
  let server, authors, photos, schema, serializer;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        author: Model,
        photo: Model,
      },
    });
    server.timing = 0;
    server.logging = false;

    authors = [
      { id: 1, name: "Link" },
      { id: 2, name: "Zelda" },
      { id: 3, name: "Epona" },
    ];
    photos = [
      { id: 1, title: "Amazing", location: "Hyrule" },
      { id: 2, title: "Photo", location: "Goron City" },
    ];
    server.db.loadData({
      authors: authors,
      photos: photos,
    });

    schema = server.schema;
    serializer = new JSONAPISerializer();
  });

  afterEach(() => {
    server.shutdown();
  });

  test("undefined shorthand with an ID that is not in the DB will return a 404 Response", () => {
    let request = { url: "/authors", params: { id: 101 } };
    let handler = new HeadShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors"
    );

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(404);
  });

  test("undefined shorthand with an ID that is in the DB will return a 204 Response", () => {
    let request = { url: "/authors", params: { id: 1 } };
    let handler = new HeadShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors"
    );

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(204);
  });

  test("undefined shorthand with coalesce true will return a 204 response if one of the IDs are found", () => {
    let request = {
      url: "/authors?ids[]=1&ids[]=3",
      queryParams: { ids: [1, 3] },
    };
    let options = { coalesce: true };
    let handler = new HeadShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors",
      options
    );

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(204);
  });

  test("undefined shorthand string (no id) shorthand returns a 204 (regardless of the length of the collection)", () => {
    let request = { url: "/authors" };
    let handler = new HeadShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors"
    );

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(204);
  });

  test("string shorthand with an ID that is not in the DB will return a 404 Response", () => {
    let request = { url: "/authors", params: { id: 101 } };
    let handler = new HeadShorthandRouteHandler(schema, serializer, "author");

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(404);
  });

  test("string shorthand with an ID that is in the DB will return a 204 Response", () => {
    let request = { url: "/authors", params: { id: 1 } };
    let handler = new HeadShorthandRouteHandler(schema, serializer, "author");

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(204);
  });

  test("string shorthand with coalesce true will return a 204 response if one of the IDs are found", () => {
    let request = {
      url: "/authors?ids[]=1&ids[]=3",
      queryParams: { ids: [1, 3] },
    };
    let options = { coalesce: true };
    let handler = new HeadShorthandRouteHandler(
      schema,
      serializer,
      "author",
      "/people",
      options
    );

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(204);
  });

  test("string shorthand string (no id) shorthand returns a 204 (regardless of the length of the collection)", () => {
    let request = { url: "/authors" };
    let handler = new HeadShorthandRouteHandler(schema, serializer, "author");

    let response = handler.handle(request);

    expect(response instanceof Response).toBeTruthy();
    expect(response.code).toBe(204);
  });
});
