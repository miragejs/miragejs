import { Server, Model, hasMany, Serializer } from "miragejs";

describe("External | Shared | Serializers | Base | Associations | Polymorphic | Top level", function () {
  let server, user;

  beforeEach(function () {
    server = new Server({
      models: {
        user: Model.extend({
          things: hasMany({ polymorphic: true }),
        }),
        picture: Model.extend(),
        car: Model.extend(),
      },
    });
    user = server.create("user", {
      things: [
        server.create("picture", { title: "Picture 1" }),
        server.create("car", { name: "Car 1" }),
      ],
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test(`it can serialize a polymorphic collection when root is false`, () => {
    server.config({
      serializers: {
        application: Serializer.extend({
          root: false,
          embed: true,
        }),
      },
    });
    let json = server.serializerOrRegistry.serialize(user.things);

    expect(json).toEqual([
      {
        id: "1",
        title: "Picture 1",
      },
      {
        id: "1",
        name: "Car 1",
      },
    ]);
  });

  test(`it throws if trying to serialize a polymorphic collection when root is true`, () => {
    server.config({
      serializers: {
        application: Serializer.extend({
          root: true,
        }),
      },
    });

    expect(() => {
      server.serializerOrRegistry.serialize(user.things);
    }).toThrow();
  });
});
