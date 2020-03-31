import { Server, Model, Serializer } from "miragejs";

const dasherize = (str) =>
  str.replace(
    /[A-Z]/g,
    (char, index) => (index !== 0 ? "-" : "") + char.toLowerCase()
  );

describe("External | Shared | Serializers | Base | Attribute Key Formatting", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      models: {
        wordSmith: Model,
      },

      serializers: {
        wordSmith: Serializer.extend({
          keyForAttribute(key) {
            return dasherize(key);
          },
        }),
      },
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`keyForAttribute formats the attributes of a model`, () => {
    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      lastName: "Jackson",
      age: 323,
    });

    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        "first-name": "Link",
        "last-name": "Jackson",
        age: 323,
      },
    });
  });

  test(`keyForAttribute also formats the models in a collections`, () => {
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
      wordSmiths: [
        { id: "1", "first-name": "Link", "last-name": "Jackson" },
        { id: "2", "first-name": "Zelda", "last-name": "Brown" },
      ],
    });
  });
});
