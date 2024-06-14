import { Server, Model, JSONAPISerializer } from "miragejs";
import snakeCase from "lodash/snakeCase.js";

describe("External | Shared | Serializers | JSON API Serializer | Key Formatting", () => {
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

  test(`keyForAttribute formats the attributes of a model`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer.extend({
          keyForAttribute(key) {
            return snakeCase(key);
          },
        }),
      },
    });
    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      lastName: "Jackson",
      age: 323,
    });

    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          age: 323,
          first_name: "Link",
          last_name: "Jackson",
        },
      },
    });
  });

  test(`keyForAttribute also formats the models in a collections`, () => {
    server.config({
      serializers: {
        application: JSONAPISerializer.extend({
          keyForAttribute(key) {
            return snakeCase(key);
          },
        }),
      },
    });

    server.schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      lastName: "Jackson",
    });
    server.schema.wordSmiths.create({
      id: 2,
      firstName: "Zelda",
      lastName: "Brown",
    });
    let wordSmiths = server.schema.wordSmiths.all();

    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            first_name: "Link",
            last_name: "Jackson",
          },
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            first_name: "Zelda",
            last_name: "Brown",
          },
        },
      ],
    });
  });
});
