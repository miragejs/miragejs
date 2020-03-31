import { Server, Model, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Attrs List", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      models: {
        wordSmith: Model,
      },
      serializers: {
        application: Serializer,
        wordSmith: Serializer.extend({
          attrs: ["id", "name"],
        }),
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it returns only the whitelisted attrs when serializing a model`, () => {
    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      name: "Link",
      age: 123,
    });

    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
      },
    });
  });

  test(`it returns only the whitelisted attrs when serializing a collection`, () => {
    server.schema.wordSmiths.create({ id: 1, name: "Link", age: 123 });
    server.schema.wordSmiths.create({ id: 2, name: "Zelda", age: 456 });

    let collection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(collection);

    expect(result).toEqual({
      wordSmiths: [
        { id: "1", name: "Link" },
        { id: "2", name: "Zelda" },
      ],
    });
  });
});
