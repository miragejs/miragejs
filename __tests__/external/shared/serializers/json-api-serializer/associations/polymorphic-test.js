import { Server, Model, belongsTo, hasMany, JSONAPISerializer } from "miragejs";

describe("External | Shared | Serializers | JSON API Serializer | Associations | Polymorphic", () => {
  test("it works for belongs to polymorphic relationships", () => {
    let server = new Server({
      models: {
        photo: Model.extend(),
        video: Model.extend(),
        comment: Model.extend({
          commentable: belongsTo({ polymorphic: true }),
        }),
      },
      serializers: {
        application: JSONAPISerializer,
        comment: JSONAPISerializer.extend({
          include: ["commentable"],
        }),
      },
    });

    let schema = server.schema;
    let photo = schema.photos.create({ title: "Foo" });
    schema.comments.create({ text: "Pretty foo!", commentable: photo });

    let video = schema.videos.create({ title: "Bar" });
    schema.comments.create({ text: "Love the bar!", commentable: video });

    let result = server.serializerOrRegistry.serialize(schema.comments.all());
    expect(result).toEqual({
      data: [
        {
          attributes: {
            text: "Pretty foo!",
          },
          id: "1",
          relationships: {
            commentable: {
              data: { id: "1", type: "photos" },
            },
          },
          type: "comments",
        },
        {
          attributes: {
            text: "Love the bar!",
          },
          id: "2",
          relationships: {
            commentable: {
              data: { id: "1", type: "videos" },
            },
          },
          type: "comments",
        },
      ],
      included: [
        {
          attributes: {
            title: "Foo",
          },
          id: "1",
          type: "photos",
        },
        {
          attributes: {
            title: "Bar",
          },
          id: "1",
          type: "videos",
        },
      ],
    });

    server.shutdown();
  });

  test("it works for has many polymorphic relationships", () => {
    let server = new Server({
      models: {
        user: Model.extend({
          things: hasMany({ polymorphic: true }),
        }),
        car: Model.extend(),
        watch: Model.extend(),
      },
      serializers: {
        application: JSONAPISerializer,
        user: JSONAPISerializer.extend({
          include: ["things"],
        }),
      },
    });

    let schema = server.schema;
    let car = schema.cars.create({ make: "Infiniti" });
    let watch = schema.watches.create({ make: "Citizen" });
    let user = schema.users.create({
      name: "Sam",
      things: [car, watch],
    });

    let json = server.serializerOrRegistry.serialize(user);

    expect(json).toEqual({
      data: {
        attributes: {
          name: "Sam",
        },
        id: "1",
        relationships: {
          things: {
            data: [
              { id: "1", type: "cars" },
              { id: "1", type: "watches" },
            ],
          },
        },
        type: "users",
      },
      included: [
        {
          attributes: {
            make: "Infiniti",
          },
          id: "1",
          type: "cars",
        },
        {
          attributes: {
            make: "Citizen",
          },
          id: "1",
          type: "watches",
        },
      ],
    });

    server.shutdown();
  });

  test("it works for has many polymorphic relationships included via query params", () => {
    let server = new Server({
      models: {
        user: Model.extend({
          things: hasMany({ polymorphic: true }),
        }),
        car: Model.extend(),
        watch: Model.extend(),
      },
      serializers: {
        application: JSONAPISerializer,
      },
    });

    let schema = server.schema;
    let car = schema.cars.create({ make: "Infiniti" });
    let watch = schema.watches.create({ make: "Citizen" });
    let user = schema.users.create({
      name: "Sam",
      things: [car, watch],
    });

    let json = server.serializerOrRegistry.serialize(user, {
      queryParams: { include: "things" },
    });

    expect(json).toEqual({
      data: {
        attributes: {
          name: "Sam",
        },
        id: "1",
        relationships: {
          things: {
            data: [
              { id: "1", type: "cars" },
              { id: "1", type: "watches" },
            ],
          },
        },
        type: "users",
      },
      included: [
        {
          attributes: {
            make: "Infiniti",
          },
          id: "1",
          type: "cars",
        },
        {
          attributes: {
            make: "Citizen",
          },
          id: "1",
          type: "watches",
        },
      ],
    });

    server.shutdown();
  });

  test("it works for a top-level polymorphic collection", () => {
    let server = new Server({
      models: {
        user: Model.extend({
          things: hasMany({ polymorphic: true }),
        }),
        car: Model.extend(),
        watch: Model.extend(),
      },
      serializers: {
        application: JSONAPISerializer,
        user: JSONAPISerializer.extend({
          include: ["things"],
        }),
      },
    });

    let schema = server.schema;
    let car = schema.cars.create({ make: "Infiniti" });
    let watch = schema.watches.create({ make: "Citizen" });
    let user = schema.users.create({
      name: "Sam",
      things: [car, watch],
    });

    let json = server.serializerOrRegistry.serialize(user.things);

    expect(json).toEqual({
      data: [
        {
          attributes: {
            make: "Infiniti",
          },
          id: "1",
          type: "cars",
        },
        {
          attributes: {
            make: "Citizen",
          },
          id: "1",
          type: "watches",
        },
      ],
    });

    server.shutdown();
  });
});
