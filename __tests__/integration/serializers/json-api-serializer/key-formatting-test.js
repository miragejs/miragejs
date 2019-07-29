import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import { Model, JSONAPISerializer } from "@miragejs/server";
import { underscore } from "@lib/utils/inflector";

describe("Integration | Serializers | JSON API Serializer | Key Formatting", () => {
  let schema;

  beforeEach(() => {
    schema = new Schema(new Db(), {
      wordSmith: Model,
      photograph: Model
    });
  });

  test(`keyForAttribute formats the attributes of a model`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer.extend({
        keyForAttribute(key) {
          return underscore(key);
        }
      })
    });
    let wordSmith = schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      lastName: "Jackson",
      age: 323
    });

    let result = registry.serialize(wordSmith);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          age: 323,
          first_name: "Link",
          last_name: "Jackson"
        }
      }
    });
  });

  test(`keyForAttribute also formats the models in a collections`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer.extend({
        keyForAttribute(key) {
          return underscore(key);
        }
      })
    });

    schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      lastName: "Jackson"
    });
    schema.wordSmiths.create({
      id: 2,
      firstName: "Zelda",
      lastName: "Brown"
    });
    let wordSmiths = schema.wordSmiths.all();

    let result = registry.serialize(wordSmiths);

    expect(result).toEqual({
      data: [
        {
          type: "word-smiths",
          id: "1",
          attributes: {
            first_name: "Link",
            last_name: "Jackson"
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            first_name: "Zelda",
            last_name: "Brown"
          }
        }
      ]
    });
  });
});
