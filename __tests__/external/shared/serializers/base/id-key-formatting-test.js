import { Server, Model, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Id Key Formatting", function () {
  test(`keyForId formats the id of a model`, () => {
    let server = new Server({
      models: {
        wordSmith: Model,
      },

      serializers: {
        wordSmith: Serializer.extend({
          keyForId() {
            return "wordSmithId";
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
      wordSmith: {
        wordSmithId: "1",
        firstName: "Link",
        lastName: "Jackson",
        age: 323,
      },
    });

    server.shutdown();
  });

  test(`primaryKey formats the id of a model`, () => {
    let server = new Server({
      models: {
        wordSmith: Model,
      },

      serializers: {
        wordSmith: Serializer.extend({
          primaryKey: "wordSmithId",
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
      wordSmith: {
        wordSmithId: "1",
        firstName: "Link",
        lastName: "Jackson",
        age: 323,
      },
    });

    server.shutdown();
  });

  test(`valueForId formats the id of a model`, () => {
    let server = new Server({
      models: {
        wordSmith: Model,
      },

      serializers: {
        wordSmith: Serializer.extend({
          valueForId(value) {
            return parseInt(value);
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
      wordSmith: {
        id: 1,
        firstName: "Link",
        lastName: "Jackson",
        age: 323,
      },
    });

    server.shutdown();
  });
});
