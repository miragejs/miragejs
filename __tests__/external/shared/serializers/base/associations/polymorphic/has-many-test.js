import { Server, Model, hasMany, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Polymorphic | Has Many", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      models: {
        user: Model.extend({
          things: hasMany({ polymorphic: true }),
        }),
        picture: Model.extend(),
      },
    });

    let post = server.schema.pictures.create({ title: "Lorem ipsum" });
    server.schema.users.create({ things: [post], name: "Ned" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can serialize a polymorphic has-many relationship when serializeIds is set to included`, () => {
    let BaseSerializer = Serializer.extend({
      embed: false,
      serializeIds: "included",
    });
    server.config({
      serializers: {
        application: BaseSerializer,
        user: BaseSerializer.extend({
          serializeIds: "included",
          include: ["things"],
        }),
      },
    });

    let user = server.schema.users.find(1);
    let result = server.serializerOrRegistry.serialize(user);

    expect(result).toEqual({
      user: {
        id: "1",
        name: "Ned",
        thingIds: [{ id: "1", type: "picture" }],
      },
      pictures: [{ id: "1", title: "Lorem ipsum" }],
    });
  });

  test(`it can serialize a polymorphic has-many relationship when serializeIds is set to always`, () => {
    let BaseSerializer = Serializer.extend({
      embed: false,
      serializeIds: "always",
    });
    server.config({
      serializers: {
        application: BaseSerializer,
        user: BaseSerializer,
      },
    });

    let user = server.schema.users.find(1);
    let result = server.serializerOrRegistry.serialize(user);

    expect(result).toEqual({
      user: {
        id: "1",
        name: "Ned",
        thingIds: [{ id: "1", type: "picture" }],
      },
    });
  });

  test(`it can serialize an embedded polymorphic has-many relationship`, () => {
    let BaseSerializer = Serializer.extend({
      embed: true,
      serializeIds: "included",
    });
    server.config({
      serializers: {
        application: BaseSerializer,
        user: BaseSerializer.extend({
          include: ["things"],
        }),
      },
    });

    let user = server.schema.users.find(1);
    let result = server.serializerOrRegistry.serialize(user);

    expect(result).toEqual({
      user: {
        id: "1",
        name: "Ned",
        things: [
          {
            id: "1",
            title: "Lorem ipsum",
          },
        ],
      },
    });
  });
});
