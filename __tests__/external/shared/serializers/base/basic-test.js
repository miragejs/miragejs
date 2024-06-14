import { Server, Model } from "miragejs";
import uniqBy from "lodash/uniqBy.js";

describe("External | Shared | Serializers | Base | Basic", function () {
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

  test("it returns objects unaffected", () => {
    let result = server.serializerOrRegistry.serialize({ oh: "hai" });

    expect(result).toEqual({ oh: "hai" });
  });

  test("it returns arrays unaffected", () => {
    let data = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    let result = server.serializerOrRegistry.serialize(data);

    expect(result).toEqual(data);
  });

  test("it returns empty arrays unaffected", () => {
    let result = server.serializerOrRegistry.serialize([]);

    expect(result).toEqual([]);
  });

  test(`it serializes a model by returning its attrs under a root`, () => {
    let wordSmith = server.schema.wordSmiths.create({
      id: 1,
      name: "Link",
    });
    let result = server.serializerOrRegistry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link",
      },
    });
  });

  test(`it serializes a collection of models by returning an array of their attrs under a pluralized root`, () => {
    server.schema.wordSmiths.create({ id: 1, name: "Link" });
    server.schema.wordSmiths.create({ id: 2, name: "Zelda" });

    let wordSmiths = server.schema.wordSmiths.all();

    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [
        { id: "1", name: "Link" },
        { id: "2", name: "Zelda" },
      ],
    });
  });

  test(`it can serialize an empty collection`, () => {
    let wordSmiths = server.schema.wordSmiths.all();
    let result = server.serializerOrRegistry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [],
    });
  });

  test("it returns POJAs of models unaffected", () => {
    server.schema.wordSmiths.create({ name: "Sam" });
    server.schema.wordSmiths.create({ name: "Sam" });
    server.schema.wordSmiths.create({ name: "Ganondorf" });

    let wordSmiths = server.schema.wordSmiths.all().models;
    let uniqueNames = uniqBy(wordSmiths, "name");
    let result = server.serializerOrRegistry.serialize(uniqueNames);

    expect(result).toEqual(uniqueNames);
  });
});
