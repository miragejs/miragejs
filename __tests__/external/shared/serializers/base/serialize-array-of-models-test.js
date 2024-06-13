import { Server, Model, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Array of Models", function () {
  let server;

  afterEach(function () {
    server.shutdown();
  });

  test(`it applies correct serializer when the response is an array of models`, () => {
    server = new Server({
      models: {
        wordSmith: Model,
      },
      serializers: {
        wordSmith: Serializer.extend({
          serialize() {
            return "serializer ran";
          },
        }),
      },
    });

    server.schema.wordSmiths.create({ id: 1, title: "Link" });

    let wordSmiths = server.schema.wordSmiths.all().filter(() => true);
    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toBe("serializer ran");
  });
});
