import { Server, Model, JSONAPISerializer } from "miragejs";

describe("External | Shared | Serializers | JSON API Serializer | Base", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      models: {
        wordSmith: Model,
      },
      serializers: {
        application: JSONAPISerializer,
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test(`it includes all attributes for a model`, () => {
    let link = server.schema.wordSmiths.create({ firstName: "Link", age: 123 });
    let result = server.serializerOrRegistry.serialize(link);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link",
          age: 123,
        },
      },
    });
  });

  test(`it includes all attributes for each model in a collection`, () => {
    server.schema.wordSmiths.create({ firstName: "Link", age: 123 });
    server.schema.wordSmiths.create({ id: 1, firstName: "Link", age: 123 });
    server.schema.wordSmiths.create({ id: 2, firstName: "Zelda", age: 456 });

    let collection = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123,
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456,
          },
        },
      ],
    });
  });

  test(`it can serialize an empty collection`, () => {
    let wordSmiths = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual({
      data: [],
    });
  });
});
