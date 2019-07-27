import SerializerRegistry from "@lib/serializer-registry";
import Serializer from "@lib/serializer";
import schemaHelper from "../schema-helper";
import { camelize } from "@lib/utils/inflector";

describe("Integration | Serializers | Base | Attribute Key Formatting", function() {
  let schema, registry;

  beforeEach(function() {
    schema = schemaHelper.setup();
    registry = new SerializerRegistry(schema, {
      wordSmith: Serializer.extend({
        keyForAttribute(key) {
          return camelize(key);
        }
      })
    });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`keyForAttribute formats the attributes of a model`, () => {
    let wordSmith = schema.wordSmiths.create({
      id: 1,
      "first-name": "Link",
      "last-name": "Jackson",
      age: 323
    });

    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      wordSmith: {
        id: "1",
        firstName: "Link",
        lastName: "Jackson",
        age: 323
      }
    });
  });

  test(`keyForAttribute also formats the models in a collections`, () => {
    schema.wordSmiths.create({
      id: 1,
      "first-name": "Link",
      "last-name": "Jackson"
    });
    schema.wordSmiths.create({
      id: 2,
      "first-name": "Zelda",
      "last-name": "Brown"
    });
    let wordSmiths = schema.wordSmiths.all();

    let result = registry.serialize(wordSmiths);

    expect(result).toEqual({
      wordSmiths: [
        { id: "1", firstName: "Link", lastName: "Jackson" },
        { id: "2", firstName: "Zelda", lastName: "Brown" }
      ]
    });
  });
});
