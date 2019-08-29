import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import { Model, JSONAPISerializer } from "@miragejs/server";

describe("Integration | Serializers | JSON API Serializer | Base", () => {
  let schema, registry;

  beforeEach(() => {
    schema = new Schema(new Db(), {
      wordSmith: Model
    });
    registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer
    });
  });

  test(`it includes all attributes for a model`, () => {
    let link = schema.wordSmiths.create({ firstName: "Link", age: 123 });
    let result = registry.serialize(link);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link",
          age: 123
        }
      }
    });
  });

  test(`it includes all attributes for each model in a collection`, () => {
    schema.wordSmiths.create({ firstName: "Link", age: 123 });
    schema.wordSmiths.create({ id: 1, firstName: "Link", age: 123 });
    schema.wordSmiths.create({ id: 2, firstName: "Zelda", age: 456 });

    let collection = schema.wordSmiths.all();
    let result = registry.serialize(collection);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            "first-name": "Link",
            age: 123
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda",
            age: 456
          }
        }
      ]
    });
  });

  test(`it can serialize an empty collection`, () => {
    let wordSmiths = schema.wordSmiths.all();
    let result = registry.serialize(wordSmiths);

    expect(result).toEqual({
      data: []
    });
  });
});
