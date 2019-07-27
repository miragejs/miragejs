import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import SerializerRegistry from "@lib/serializer-registry";
import { Model, JSONAPISerializer } from "@miragejs/server";

describe("Integration | Serializers | JSON API Serializer | Attrs List", () => {
  let schema;

  beforeEach(() => {
    schema = new Schema(new Db(), {
      wordSmith: Model,
      photograph: Model
    });
  });

  test(`it returns only the whitelisted attrs when serializing a model`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        attrs: ["firstName"]
      })
    });
    let user = schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      age: 123
    });

    let result = registry.serialize(user);

    expect(result).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link"
        }
      }
    });
  });

  test(`it returns only the whitelisted attrs when serializing a collection`, () => {
    let registry = new SerializerRegistry(schema, {
      application: JSONAPISerializer,
      wordSmith: JSONAPISerializer.extend({
        attrs: ["firstName"]
      })
    });
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
            "first-name": "Link"
          }
        },
        {
          type: "word-smiths",
          id: "2",
          attributes: {
            "first-name": "Zelda"
          }
        }
      ]
    });
  });

  test(`it can use different attr whitelists for different serializers`, () => {
    let registry = new SerializerRegistry(schema, {
      wordSmith: JSONAPISerializer.extend({
        attrs: ["firstName"]
      }),
      photograph: JSONAPISerializer.extend({
        attrs: ["title"]
      })
    });

    let link = schema.wordSmiths.create({
      id: 1,
      firstName: "Link",
      age: 123
    });
    expect(registry.serialize(link)).toEqual({
      data: {
        type: "word-smiths",
        id: "1",
        attributes: {
          "first-name": "Link"
        }
      }
    });

    let photo = schema.photographs.create({
      id: 1,
      title: "Lorem ipsum",
      createdAt: "2010-01-01"
    });
    expect(registry.serialize(photo)).toEqual({
      data: {
        type: "photographs",
        id: "1",
        attributes: {
          title: "Lorem ipsum"
        }
      }
    });
  });
});
