import SerializerRegistry from "@lib/serializer-registry";
import Serializer from "@lib/serializer";
import schemaHelper from "../schema-helper";

describe("Integration | Serializers | Base | Root", function() {
  let schema, registry;

  beforeEach(function() {
    schema = schemaHelper.setup();
    registry = new SerializerRegistry(schema, {
      wordSmith: Serializer.extend({
        embed: true,
        root: false
      })
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`if root is false, it serializes a model by returning its attrs`, () => {
    let wordSmith = schema.wordSmiths.create({
      id: "1",
      name: "Link"
    });

    let result = registry.serialize(wordSmith);
    expect(result).toEqual({
      id: "1",
      name: "Link"
    });
  });

  test(`if root is false, it serializes a collection of models by returning an array of their attrs`, () => {
    schema.wordSmiths.create({ id: 1, name: "Link" });
    schema.wordSmiths.create({ id: 2, name: "Zelda" });
    let wordSmiths = schema.wordSmiths.all();

    let result = registry.serialize(wordSmiths);

    expect(result).toEqual([
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" }
    ]);
  });

  test(`if root is false, it serializes an empty collection by returning an empty array`, () => {
    let emptywordSmithCollection = schema.wordSmiths.all();
    let result = registry.serialize(emptywordSmithCollection);

    expect(result).toEqual([]);
  });
});
