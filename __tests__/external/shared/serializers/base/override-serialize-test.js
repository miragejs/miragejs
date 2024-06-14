import { Server, Model, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Overriding Serialize", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      models: {
        wordSmith: Model,
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can use a completely custom serialize function`, () => {
    server.config({
      serializers: {
        wordSmith: Serializer.extend({
          serialize() {
            return "blah";
          },
        }),
      },
    });
    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      title: "Link",
    });

    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toBe("blah");
  });

  test(`it can access the request in a custom serialize function`, () => {
    server.config({
      serializers: {
        wordSmith: Serializer.extend({
          serialize(response, request) {
            return request.queryParams.foo || "blah";
          },
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      title: "Link",
    });

    let request = {
      url: "/word-smiths/1?foo=bar",
      params: { id: "1" },
      queryParams: { foo: "bar" },
    };
    let result = server.serializerOrRegistry.serialize(wordSmith, request);

    expect(result).toBe("bar");
  });

  test(`it can access the databse while in a serializer method`, () => {
    server.config({
      serializers: {
        wordSmith: Serializer.extend({
          serialize(response, request) {
            let id = request.params.id;
            return server.schema.db.wordSmiths.find(id).title || "No title";
          },
        }),
      },
    });

    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      title: "Title in database",
    });

    let request = {
      url: "/word-smiths/1?foo=bar",
      params: { id: "1" },
      queryParams: { foo: "bar" },
    };
    let result = server.serializerOrRegistry.serialize(wordSmith, request);

    expect(result).toBe("Title in database");
  });
});
