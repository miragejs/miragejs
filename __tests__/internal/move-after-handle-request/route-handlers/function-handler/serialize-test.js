import { Server, Model, Collection, ActiveModelSerializer } from "miragejs";
import uniqBy from "lodash/uniqBy.js";

describe("Integration | Route handlers | Function handler | #serialize", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        user: Model.extend({}),
      },
      serializers: {
        application: ActiveModelSerializer,
        sparseUser: ActiveModelSerializer.extend({
          attrs: ["id", "name", "tall"],
        }),
      },
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it uses the default serializer on a model", async () => {
    expect.assertions(1);

    server.create("user", { name: "Sam" });

    server.get("/users", function (schema) {
      let user = schema.users.first();
      let json = this.serialize(user);

      expect(json).toEqual({
        user: {
          id: "1",
          name: "Sam",
        },
      });

      return true;
    });

    await fetch("/users");
  });

  test("it uses the default serializer on a collection", async () => {
    expect.assertions(1);

    server.create("user", { name: "Sam" });

    server.get("/users", function (schema) {
      let users = schema.users.all();
      let json = this.serialize(users);

      expect(json).toEqual({
        users: [{ id: "1", name: "Sam" }],
      });

      return true;
    });

    await fetch("/users");
  });

  test("it takes an optional serializer type", async () => {
    expect.assertions(1);

    server.create("user", { name: "Sam", tall: true, evil: false });
    server.create("user", { name: "Ganondorf", tall: true, evil: true });

    server.get("/users", function (schema) {
      let users = schema.users.all();
      let json = this.serialize(users, "sparse-user");

      expect(json).toEqual({
        users: [
          { id: "1", name: "Sam", tall: true },
          { id: "2", name: "Ganondorf", tall: true },
        ],
      });

      return true;
    });

    await fetch("/users");
  });

  test("it throws an error when trying to specify a serializer that doesnt exist", async () => {
    expect.assertions(2);

    server.create("user", { name: "Sam" });
    server.get("/users", function (schema) {
      let users = schema.users.all();

      this.serialize(users, "foo-user");
    });

    let res = await fetch("/users");
    let data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toMatch(`that serializer doesn't exist`);
  });

  test("it noops on plain JS arrays", async () => {
    expect.assertions(1);

    server.create("user", { name: "Sam" });
    server.create("user", { name: "Ganondorf" });

    server.get("/users", function (schema) {
      let names = schema.users.all().models.map((user) => user.name);
      let json = this.serialize(names);

      expect(json).toEqual(names);
    });

    await fetch("/users");
  });

  test("it can take an optional serializer type on a Collection", async () => {
    expect.assertions(1);

    server.create("user", { name: "Sam", tall: true, evil: false });
    server.create("user", { name: "Sam", tall: true, evil: false });
    server.create("user", { name: "Ganondorf", tall: true, evil: true });

    server.get("/users", function (schema) {
      let users = schema.users.all().models;
      let uniqueNames = uniqBy(users, "name");
      let collection = new Collection("user", uniqueNames);
      let json = this.serialize(collection, "sparse-user");

      expect(json).toEqual({
        users: [
          { id: "1", name: "Sam", tall: true },
          { id: "3", name: "Ganondorf", tall: true },
        ],
      });
    });

    await fetch("/users");
  });
});
