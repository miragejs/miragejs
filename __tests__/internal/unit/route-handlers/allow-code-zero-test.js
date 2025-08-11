import { JSONAPISerializer, Model, Server } from "miragejs";
import RouteHandler from "@lib/route-handler";

describe("unit | Route Handler | Allows zero response code", () => {
  let server, registry, type, request, schema, serializer;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        author: Model.extend({}),
      },
    });
    server.timing = 0;
    server.logging = false;
    server.db.loadData({
      authors: [{ id: 1, name: "Link" }],
    });

    schema = server.schema;
    registry = {
      serializerFor() {
        return serializer;
      },
    };
    type = "foo";
    request = {};
    serializer = new JSONAPISerializer(registry, type, request);
  });

  afterEach(() => {
    server.shutdown();
  });

  test("customized code of zero is passed through", async () => {
    let request = { url: "/authors" };
    let rawHandler = (schema, request) => schema.all("author");
    let handler = new RouteHandler({
      schema,
      verb: "get",
      rawHandler,
      customizedCode: 0,
      options: {},
      path: "/authors",
      serializerOrRegistry: serializer,
      middleware: [],
    });

    let response = await handler.handle(request);

    expect(response[0]).toBe(0);
  });
});
