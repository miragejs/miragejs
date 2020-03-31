import { Server, Model, JSONAPISerializer } from "miragejs";

describe("External | Shared | Serializers | JSON API Serializer | Attrs List", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      models: {
        wordSmith: Model,
        photograph: Model,
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test(`it returns only the whitelisted attrs when serializing a model`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          attrs: ["firstName"],
        }),
      },
    });
    let user = server.schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      age: 123,
    });

    let result = server.serializerOrRegistry.serialize(user);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link",
        },
      },
    });
  });

  test(`it returns only the whitelisted attrs when serializing a collection`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer,
        wordSmith: JSONAPISerializer.extend({
          attrs: ["firstName"],
        }),
      },
    });
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
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
          },
        },
      ],
    });
  });

  test(`it can use different attr whitelists for different serializers`, () => {
    server.config({
      serializers: {
        wordSmith: JSONAPISerializer.extend({
          attrs: ["firstName"],
        }),
        photograph: JSONAPISerializer.extend({
          attrs: ["title"],
        }),
      },
    });

    let link = server.schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      age: 123,
    });
    expect(server.serializerOrRegistry.serialize(link)).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link",
        },
      },
    });

    let photo = server.schema.photographs.create({
      id: 1,
      title: "Lorem ipsum",
      createdAt: "2010-01-01",
    });
    expect(server.serializerOrRegistry.serialize(photo)).toEqual({
      data: {
        type: "photographs",
        id: "1",
        attributes: {
          title: "Lorem ipsum",
        },
      },
    });
  });
});
