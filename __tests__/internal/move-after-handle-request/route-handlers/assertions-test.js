import { Server, Model, JSONAPISerializer } from "miragejs";
import FunctionRouteHandler from "@lib/route-handlers/function";

describe("Integration | Route handlers | Assertions", () => {
  let server;
  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        user: Model.extend({}),
        comment: Model.extend({}),
      },
      serializers: {
        application: JSONAPISerializer,
      },
    });
    server.timing = 0;
    server.logging = false;

    server.post("/users");
  });

  afterEach(() => {
    server.shutdown();
  });

  test("a helpful assert is thrown if a relationship passed in a request is not a defined association on the posted model", async () => {
    expect.assertions(1);

    let request = {
      requestHeaders: {},
      method: "POST",
      url: "/users",
      requestBody: JSON.stringify({
        data: {
          type: "user",
          attributes: {
            name: "Jacob Dylan",
          },
          relationships: {
            comments: {
              data: {
                type: "comment",
                name: "Bob Dylan",
              },
            },
          },
        },
      }),
    };

    let functionHandler = new FunctionRouteHandler(
      server.schema,
      server.serializerOrRegistry
    );
    functionHandler.path = "/users";
    functionHandler.request = request;

    expect(function () {
      functionHandler.normalizedRequestAttrs();
    }).toThrow();
  });
});
