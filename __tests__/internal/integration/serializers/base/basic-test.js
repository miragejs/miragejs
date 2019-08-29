import SerializerRegistry from "@lib/serializer-registry";
import schemaHelper from "../schema-helper";
import uniqBy from "lodash.uniqby";

describe("Integration | Serializers | Base | Basic", function() {
  let schema, registry;

  beforeEach(function() {
    schema = schemaHelper.setup();
    registry = new SerializerRegistry(schema);
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test("it returns objects unaffected", () => {
    let result = registry.serialize({ oh: "hai" });

    expect(result).toEqual({ oh: "hai" });
  });

  test("it returns arrays unaffected", () => {
    let data = [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }];
    let result = registry.serialize(data);

    expect(result).toEqual(data);
  });

  test("it returns empty arrays unaffected", () => {
    let result = registry.serialize([]);

    expect(result).toEqual([]);
  });

  test(`it serializes a model by returning its attrs under a root`, () => {
    let wordSmith = schema.wordSmiths.create({
      id: 1,
      name: "Link"
    });
    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link"
      }
    });
  });

  test(`it serializes a collection of models by returning an array of their attrs under a pluralized root`, () => {
    schema.wordSmiths.create({ id: 1, name: "Link" });
    schema.wordSmiths.create({ id: 2, name: "Zelda" });

    let wordSmiths = schema.wordSmiths.all();

    let result = registry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }]
    });
  });

  test(`it can serialize an empty collection`, () => {
    let wordSmiths = schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: []
    });
  });

  test("it returns POJAs of models unaffected", () => {
    schema.wordSmiths.create({ name: "Sam" });
    schema.wordSmiths.create({ name: "Sam" });
    schema.wordSmiths.create({ name: "Ganondorf" });

    let wordSmiths = schema.wordSmiths.all().models;
    let uniqueNames = uniqBy(wordSmiths, "name");
    let result = registry.serialize(uniqueNames);

    expect(result).toEqual(uniqueNames);
  });
});
