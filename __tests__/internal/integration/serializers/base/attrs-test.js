import SerializerRegistry from "@lib/serializer-registry";
import Serializer from "@lib/serializer";
import schemaHelper from "../schema-helper";

describe("Integration | Serializers | Base | Attrs List", function() {
  let schema, registry;

  beforeEach(function() {
    schema = schemaHelper.setup();
    registry = new SerializerRegistry(schema, {
      wordSmith: Serializer.extend({
        attrs: ["id", "name"]
      })
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it returns only the whitelisted attrs when serializing a model`, () => {
    let wordSmith = schema.wordSmiths.create({
      id: 1,
      name: "Link",
      age: 123
    });

    let result = registry.serialize(wordSmith);
    expect(result).toEqual({
      wordSmith: {
        id: "1",
        name: "Link"
      }
    });
  });

  test(`it returns only the whitelisted attrs when serializing a collection`, () => {
    schema.wordSmiths.create({ id: 1, name: "Link", age: 123 });
    schema.wordSmiths.create({ id: 2, name: "Zelda", age: 456 });

    let collection = schema.wordSmiths.all();
    let result = registry.serialize(collection);

    expect(result).toEqual({
      wordSmiths: [{ id: "1", name: "Link" }, { id: "2", name: "Zelda" }]
    });
  });
});
