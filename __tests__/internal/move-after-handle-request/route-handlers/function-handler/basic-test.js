import { Server, Model, ActiveModelSerializer, Response } from "miragejs";

describe("Integration | Route handlers | Function handler", () => {
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

  test("a meaningful error is thrown if a custom route handler throws an error", async () => {
    server.get("/users", function () {
      throw "I goofed";
    });

    let res = await fetch("/users");
    let data = await res.json();

    expect(data.message).toBe("I goofed");
    expect(data.stack).toMatch(
      "Mirage: Your GET handler for the url /users threw an error"
    );
  });

  test("mirage response string is not serialized to string", async () => {
    expect.assertions(1);

    server.get("/users", function () {
      return new Response(
        200,
        { "Content-Type": "text/csv" },
        "firstname,lastname\nbob,dylon"
      );
    });

    let res = await fetch("/users");
    let text = await res.text();

    expect(text).toBe("firstname,lastname\nbob,dylon");
  });

  test("it can return a promise with non-serializable content", async () => {
    expect.assertions(1);

    server.get("/users", function () {
      return new Promise((resolve) => {
        resolve(
          new Response(
            200,
            { "Content-Type": "text/csv" },
            "firstname,lastname\nbob,dylan"
          )
        );
      });
    });

    let res = await fetch("/users");
    let text = await res.text();

    expect(text).toBe("firstname,lastname\nbob,dylan");
  });

  test("it can return a promise with serializable content", async () => {
    expect.assertions(1);

    let user = server.create("user", { name: "Sam" });

    server.get("/users", function (schema) {
      return new Promise((resolve) => {
        resolve(schema.users.all());
      });
    });

    let res = await fetch("/users");
    let data = await res.json();

    expect(data).toEqual({ users: [{ id: user.id, name: "Sam" }] });
  });

  test("it can return a promise with an empty string", async () => {
    expect.assertions(3);

    server.get("/users", function () {
      return new Promise((resolve) => {
        resolve(new Response(200, { "Content-Type": "text/csv" }, ""));
      });
    });

    let res = await fetch("/users");
    let text = await res.text();

    expect(text).toBe("");
    expect(res.status).toBe(200);
    expect([...res.headers.entries()]).toEqual([["content-type", "text/csv"]]);
  });

  test(`it can serialize a POJA of models`, async () => {
    expect.assertions(1);

    server.createList("user", 3);
    server.get("/users", (schema) => {
      return schema.users.all().models;
    });

    let res = await fetch("/users");
    let data = await res.json();

    expect(data).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
  });
});
