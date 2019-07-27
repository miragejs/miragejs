import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import { Model, JSONAPISerializer } from "@miragejs/server";

describe("Integration | Serializers | JSON API Serializer | Base", function() {
  beforeEach(function() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model
    });
    this.registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer
    });
  });

  test(`it includes all attributes for a model`, () => {
    let link = this.schema.wordSmiths.create({ firstName: "Link", age: 123 });
    let result = this.registry.serialize(link);

    assert.deepEqual(result, {
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
    this.schema.wordSmiths.create({ firstName: "Link", age: 123 });
    this.schema.wordSmiths.create({ id: 1, firstName: "Link", age: 123 });
    this.schema.wordSmiths.create({ id: 2, firstName: "Zelda", age: 456 });

    let collection = this.schema.wordSmiths.all();
    let result = this.registry.serialize(collection);

    assert.deepEqual(result, {
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
    let wordSmiths = this.schema.wordSmiths.all();
    let result = this.registry.serialize(wordSmiths);

    assert.deepEqual(result, {
      data: []
    });
  });
});
