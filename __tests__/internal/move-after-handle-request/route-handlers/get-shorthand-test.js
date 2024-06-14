import {
  Model,
  hasMany,
  belongsTo,
  JSONAPISerializer,
  RestSerializer,
  Response,
  Server,
} from "miragejs";
import Collection from "@lib/orm/collection";
import GetShorthandRouteHandler from "@lib/route-handlers/shorthands/get";

describe("Integration | Route Handlers | GET shorthand", () => {
  let server, authors, posts, photos, projectOwners, schema, serializer;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        author: Model.extend({
          posts: hasMany(),
        }),
        post: Model.extend({
          author: belongsTo(),
          comments: hasMany(),
        }),
        comment: Model.extend({
          post: belongsTo(),
        }),
        photo: Model,
        "project-owner": Model,
      },
    });
    server.timing = 0;
    server.logging = false;

    authors = [
      { id: 1, name: "Link" },
      { id: 2, name: "Zelda" },
      { id: 3, name: "Epona" },
    ];
    posts = [
      { id: 1, title: "Lorem", authorId: 1 },
      { id: 2, title: "Ipsum", authorId: 1 },
    ];
    photos = [
      { id: 1, title: "Amazing", location: "Hyrule" },
      { id: 2, title: "Photo", location: "Goron City" },
    ];
    projectOwners = [{ id: 1, name: "Nintendo" }];
    server.db.loadData({
      authors: authors,
      posts: posts,
      photos: photos,
      projectOwners: projectOwners,
    });

    schema = server.schema;
    serializer = new JSONAPISerializer();
  });

  afterEach(() => {
    server.shutdown();
  });

  test("undefined shorthand returns the collection of models", () => {
    let request = { url: "/authors" };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors"
    );

    let authors = handler.handle(request);

    expect(authors.models).toHaveLength(3);
    expect(authors.models[0] instanceof Model).toBeTruthy();
    expect(authors.models[0].modelName).toBe("author");
  });

  test("undefined shorthand ignores query params", () => {
    let request = { url: "/authors?foo=bar" };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors"
    );

    let authors = handler.handle(request);

    expect(authors.models).toHaveLength(3);
    expect(authors.models[0] instanceof Model).toBeTruthy();
    expect(authors.models[0].modelName).toBe("author");
  });

  test("undefined shorthand can return a single model", () => {
    let request = { url: "/authors/2", params: { id: 2 } };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors/:id"
    );

    let author = handler.handle(request);

    expect(author instanceof Model).toBeTruthy();
    expect(author.modelName).toBe("author");
    expect(author.name).toBe("Zelda");
  });

  test("undefined shorthand returns a 404 if a singular resource does not exist", () => {
    let request = { url: "/authors/99", params: { id: 99 } };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors/:id"
    );

    let author = handler.handle(request);

    expect(author instanceof Response).toBeTruthy();
    expect(author.code).toBe(404);
  });

  test("undefined shorthand ignores query params for a singular resource", () => {
    let request = { url: "/authors/2?foo=bar", params: { id: 2 } };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors/:id"
    );

    let author = handler.handle(request);

    expect(author instanceof Model).toBeTruthy();
    expect(author.modelName).toBe("author");
    expect(author.name).toBe("Zelda");
  });

  test("undefined shorthand with coalesce true returns the appropriate models [JSONAPI]", () => {
    let request = {
      url: "/authors?filter[id]=1,3",
      queryParams: { "filter[id]": "1,3" },
    };
    let options = { coalesce: true };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      "/authors",
      options
    );

    let authors = handler.handle(request);

    expect(authors.models).toHaveLength(2);
    expect(authors.models.map((author) => author.name)).toEqual([
      "Link",
      "Epona",
    ]);
  });

  test("undefined shorthand with coalesce true returns the appropriate models [REST]", () => {
    let request = {
      url: "/authors?ids[]=1&ids[]=3",
      queryParams: { ids: [1, 3] },
    };
    let options = { coalesce: true };
    let handler = new GetShorthandRouteHandler(
      schema,
      new RestSerializer(),
      undefined,
      "/authors",
      options
    );

    let authors = handler.handle(request);

    expect(authors.models).toHaveLength(2);
    expect(authors.models.map((author) => author.name)).toEqual([
      "Link",
      "Epona",
    ]);
  });

  test("string shorthand returns the correct collection of models", () => {
    let request = { url: "/people" };
    let handler = new GetShorthandRouteHandler(schema, serializer, "author");

    let authors = handler.handle(request);

    expect(authors.models).toHaveLength(3);
    expect(authors.models[0] instanceof Model).toBeTruthy();
    expect(authors.models[0].modelName).toBe("author");
  });

  test("string shorthand with an id returns the correct model", () => {
    let request = { url: "/people/2", params: { id: 2 } };
    let handler = new GetShorthandRouteHandler(schema, serializer, "author");

    let author = handler.handle(request);

    expect(author instanceof Model).toBeTruthy();
    expect(author.modelName).toBe("author");
    expect(author.name).toBe("Zelda");
  });

  test("string shorthand with an id 404s if the model is not found", () => {
    let request = { url: "/people/99", params: { id: 99 } };
    let handler = new GetShorthandRouteHandler(schema, serializer, "author");

    let author = handler.handle(request);

    expect(author instanceof Response).toBeTruthy();
    expect(author.code).toBe(404);
  });

  test("string shorthand with coalesce returns the correct models [JSONAPI]", () => {
    let request = {
      url: "/authors?filter[id]=1,3",
      queryParams: { "filter[id]": "1,3" },
    };
    let options = { coalesce: true };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      "author",
      "/people",
      options
    );

    let authors = handler.handle(request);

    expect(authors.models).toHaveLength(2);
    expect(authors.models.map((author) => author.name)).toEqual([
      "Link",
      "Epona",
    ]);
  });

  test("string shorthand with coalesce returns the correct models [REST]", () => {
    let request = {
      url: "/people?ids[]=1&ids[]=3",
      queryParams: { ids: [1, 3] },
    };
    let options = { coalesce: true };
    let handler = new GetShorthandRouteHandler(
      schema,
      new RestSerializer(),
      "author",
      "/people",
      options
    );

    let authors = handler.handle(request);

    expect(authors.models).toHaveLength(2);
    expect(authors.models.map((author) => author.name)).toEqual([
      "Link",
      "Epona",
    ]);
  });

  test("array shorthand returns the correct models", () => {
    let url = "/home";
    let request = { url };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      ["authors", "photos"],
      url
    );

    let models = handler.handle(request);

    expect(models[0] instanceof Collection).toBeTruthy();
    expect(models[0].modelName).toBe("author");
    expect(models[0].models).toHaveLength(authors.length);

    expect(models[1] instanceof Collection).toBeTruthy();
    expect(models[1].modelName).toBe("photo");
    expect(models[1].models).toHaveLength(photos.length);
  });

  test("array shorthand for a singular resource errors", () => {
    let url = "/authors/1";
    let request = { url, params: { id: 1 } };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      ["author", "posts"],
      url
    );

    expect(function () {
      handler.handle(request);
    }).toThrow();
  });

  test("shorthand for list of models with a dash in their name", () => {
    let url = "/project-owners";
    let request = { url };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      url
    );
    let models = handler.handle(request);

    expect(models.models).toHaveLength(1);
    expect(models.models[0] instanceof Model).toBeTruthy();
    expect(models.models[0].modelName).toBe("project-owner");
  });

  test("if a shorthand tries to access an unknown type it throws an error", () => {
    let url = "/foobars";
    let request = { url };
    let handler = new GetShorthandRouteHandler(
      schema,
      serializer,
      undefined,
      url
    );

    expect(function () {
      handler.handle(request);
    }).toThrow();
  });
});
