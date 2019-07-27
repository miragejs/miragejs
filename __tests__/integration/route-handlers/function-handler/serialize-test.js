
import { Model, Collection, ActiveModelSerializer } from "@miragejs/server";
import Server from "@miragejs/server/server";
import { uniqBy } from "lodash-es";
import promiseAjax from "../../../helpers/promise-ajax";

describe("Integration | Route handlers | Function handler | #serialize", function(
  hooks
) {
  let server; beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        user: Model.extend({})
      },
      serializers: {
        application: ActiveModelSerializer,
        sparseUser: ActiveModelSerializer.extend({
          attrs: ["id", "name", "tall"]
        })
      }
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it uses the default serializer on a model", async () => {
    assert.expect(1);

    server.create("user", { name: "Sam" });

    server.get("/users", function(schema) {
      let user = schema.users.first();
      let json = serialize(user);

      expect(json).toEqual({
        user: {
          id: "1",
          name: "Sam"
        }
      });

      return true;
    });

    await promiseAjax({ method: "GET", url: "/users" });
  });

  test("it uses the default serializer on a collection", async () => {
    assert.expect(1);

    server.create("user", { name: "Sam" });

    server.get("/users", function(schema) {
      let users = schema.users.all();
      let json = serialize(users);

      expect(json).toEqual({
        users: [{ id: "1", name: "Sam" }]
      });

      return true;
    });

    await promiseAjax({ method: "GET", url: "/users" });
  });

  test("it takes an optional serializer type", async () => {
    assert.expect(1);

    server.create("user", { name: "Sam", tall: true, evil: false });
    server.create("user", { name: "Ganondorf", tall: true, evil: true });

    server.get("/users", function(schema) {
      let users = schema.users.all();
      let json = serialize(users, "sparse-user");

      expect(json).toEqual({
        users: [
          { id: "1", name: "Sam", tall: true },
          { id: "2", name: "Ganondorf", tall: true }
        ]
      });

      return true;
    });

    await promiseAjax({ method: "GET", url: "/users" });
  });

  test("it throws an error when trying to specify a serializer that doesnt exist", async () => {
    assert.expect(1);

    server.create("user", { name: "Sam" });
    server.get("/users", function(schema) {
      let users = schema.users.all();

      serialize(users, "foo-user");
    });

    assert.rejects(promiseAjax({ method: "GET", url: "/users" }), function(
      ajaxError
    ) {
      return (
        ajaxError.xhr.responseText.indexOf(`that serializer doesn't exist`) > 0
      );
    });
  });

  test("it noops on plain JS arrays", async () => {
    assert.expect(1);

    server.create("user", { name: "Sam" });
    server.create("user", { name: "Ganondorf" });

    server.get("/users", function(schema) {
      let names = schema.users.all().models.map(user => user.name);
      let json = serialize(names);

      expect(json).toEqual(names);
    });

    await promiseAjax({ method: "GET", url: "/users" });
  });

  test("it can take an optional serializer type on a Collection", async () => {
    assert.expect(1);

    server.create("user", { name: "Sam", tall: true, evil: false });
    server.create("user", { name: "Sam", tall: true, evil: false });
    server.create("user", { name: "Ganondorf", tall: true, evil: true });

    server.get("/users", function(schema) {
      let users = schema.users.all().models;
      let uniqueNames = uniqBy(users, "name");
      let collection = new Collection("user", uniqueNames);
      let json = serialize(collection, "sparse-user");

      expect(json).toEqual({
        users: [
          { id: "1", name: "Sam", tall: true },
          { id: "3", name: "Ganondorf", tall: true }
        ]
      });
    });

    await promiseAjax({ method: "GET", url: "/users" });
  });
});
