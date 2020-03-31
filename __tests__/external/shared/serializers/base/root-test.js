import { Server, Model, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Root", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      models: {
        wordSmith: Model,
      },
      serializers: {
        wordSmith: Serializer.extend({
          embed: true,
          root: false,
        }),
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`if root is false, it serializes a model by returning its attrs`, () => {
    let wordSmith = server.schema.wordSmiths.create({
      id: "1",
      name: "Link",
    });

    let result = server.serializerOrRegistry.serialize(wordSmith);
    expect(result).toEqual({
      id: "1",
      name: "Link",
    });
  });

  test(`if root is false, it serializes a collection of models by returning an array of their attrs`, () => {
    server.schema.wordSmiths.create({ id: 1, name: "Link" });
    server.schema.wordSmiths.create({ id: 2, name: "Zelda" });
    let wordSmiths = server.schema.wordSmiths.all();

    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual([
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ]);
  });

  test(`if root is false, it serializes an empty collection by returning an empty array`, () => {
    let emptywordSmithCollection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(
      emptywordSmithCollection
    );

    expect(result).toEqual([]);
  });
});
