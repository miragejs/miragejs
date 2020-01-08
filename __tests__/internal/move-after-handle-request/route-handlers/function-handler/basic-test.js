import {
  Server,
  Model,
  ActiveModelSerializer,
  Response,
  JSONAPISerializer,
  belongsTo
} from "miragejs";

describe("Integration | Route handlers | Function handler", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        user: Model.extend({}),
        post: Model.extend({
          author: belongsTo()
        }),
        author: Model
      },
      serializers: {
        application: ActiveModelSerializer,
        sparseUser: ActiveModelSerializer.extend({
          attrs: ["id", "name", "tall"]
        }),
        post: JSONAPISerializer,
        author: JSONAPISerializer
      }
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
  });

  test("a meaningful error is thrown if a custom route handler throws an error", async () => {
    server.get("/users", function() {
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

    server.get("/users", function() {
      return new Response(
        200,
        { "Content-Type": "text/csv" },
        "firstname,lastname\nbob,dylon"
      );
    });

    let res = await fetch("/users");
    let text = await res.text();

    expect(text).toEqual("firstname,lastname\nbob,dylon");
  });

  test("it can return a promise with non-serializable content", async () => {
    expect.assertions(1);

    server.get("/users", function() {
      return new Promise(resolve => {
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

    expect(text).toEqual("firstname,lastname\nbob,dylan");
  });

  test("it can return a promise with serializable content", async () => {
    expect.assertions(1);

    let user = server.create("user", { name: "Sam" });

    server.get("/users", function(schema) {
      return new Promise(resolve => {
        resolve(schema.users.all());
      });
    });

    let res = await fetch("/users");
    let data = await res.json();

    expect(data).toEqual({ users: [{ id: user.id, name: "Sam" }] });
  });

  test("it can return a promise with an empty string", async () => {
    expect.assertions(3);

    server.get("/users", function() {
      return new Promise(resolve => {
        resolve(new Response(200, { "Content-Type": "text/csv" }, ""));
      });
    });

    let res = await fetch("/users");
    let text = await res.text();

    expect(text).toEqual("");
    expect(res.status).toEqual(200);
    expect([...res.headers.entries()]).toEqual([["content-type", "text/csv"]]);
  });

  test(`it can serialize a POJA of models`, async () => {
    expect.assertions(1);

    server.createList("user", 3);
    server.get("/users", schema => {
      return schema.users.all().models;
    });

    let res = await fetch("/users");
    let data = await res.json();

    expect(data).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
  });

  test("it can serialize empty includes", async () => {
    expect.assertions(1);

    server.create("post", {
      author: server.create("author", { id: 1, name: "Daniel" }),
      title: "abcd"
    });
    server.create("post", {
      author: server.create("author", { id: 2, name: "Alexandre" }),
      title: "abcd"
    });

    server.get("/posts/:id", (schema, request) => {
      return schema.posts.find(request.params.id);
    });

    let res = await fetch("/posts/1?include=");
    expect(res.status).toBe(200);
  });

  test("it can serialize includes with trailing comma", async () => {
    expect.assertions(2);

    server.create("post", {
      author: server.create("author", { id: 1, name: "Daniel" }),
      title: "abcd"
    });
    server.create("post", {
      author: server.create("author", { id: 2, name: "Alexandre" }),
      title: "abcd"
    });

    server.get("/posts/:id", (schema, request) => {
      return schema.posts.find(request.params.id);
    });

    let res = await fetch("/posts/1?include=author,");
    let data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({
      data: {
        type: 'posts',
        id: '1',
        attributes: { title: 'abcd' },
        relationships: { 
          author: { 
            data: { 
              type: 'authors',
              id: '1' 
            } 
          } 
        }
      },
      included: [
        { 
          type: "authors",
          id: "1",
          attributes: {
            name: "Daniel"
          } 
        }
    ]
    });
  });
});
