import { Model, hasMany } from "@miragejs/server";
import Schema from "@lib/orm/schema";
import Db from "@lib/db";
import Serializer from "@lib/serializer";
import SerializerRegistry from "@lib/serializer-registry";

describe("Integration | Serializers | Base | Associations | Polymorphic | Has Many", function() {
  let schema;

  beforeEach(function() {
    schema = new Schema(new Db(), {
      user: Model.extend({
        things: hasMany({ polymorphic: true })
      }),
      picture: Model.extend()
    });

    let post = schema.pictures.create({ title: "Lorem ipsum" });
    schema.users.create({ things: [post], name: "Ned" });
  });

  afterEach(function() {
    schema.db.emptyData();
  });

  test(`it can serialize a polymorphic has-many relationship when serializeIds is set to included`, () => {
    let BaseSerializer = Serializer.extend({
      embed: false,
      serializeIds: "included"
    });
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      user: BaseSerializer.extend({
        serializeIds: "included",
        include: ["things"]
      })
    });

    let user = schema.users.find(1);
    let result = registry.serialize(user);

    expect(result).toEqual({
      user: {
        id: "1",
        name: "Ned",
        thingIds: [{ id: "1", type: "picture" }]
      },
      pictures: [{ id: "1", title: "Lorem ipsum" }]
    });
  });

  test(`it can serialize a polymorphic has-many relationship when serializeIds is set to always`, () => {
    let BaseSerializer = Serializer.extend({
      embed: false,
      serializeIds: "always"
    });
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      user: BaseSerializer
    });

    let user = schema.users.find(1);
    let result = registry.serialize(user);

    expect(result).toEqual({
      user: {
        id: "1",
        name: "Ned",
        thingIds: [{ id: "1", type: "picture" }]
      }
    });
  });

  test(`it can serialize an embedded polymorphic has-many relationship`, () => {
    let BaseSerializer = Serializer.extend({
      embed: true,
      serializeIds: "included"
    });
    let registry = new SerializerRegistry(schema, {
      application: BaseSerializer,
      user: BaseSerializer.extend({
        include: ["things"]
      })
    });

    let user = schema.users.find(1);
    let result = registry.serialize(user);

    expect(result).toEqual({
      user: {
        id: "1",
        name: "Ned",
        things: [
          {
            id: "1",
            title: "Lorem ipsum"
          }
        ]
      }
    });
  });
});
