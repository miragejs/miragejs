import { Server, Model, hasMany, belongsTo, RestSerializer } from "miragejs";

describe("Integration | Server | Shorthands | REST Serializer Sanity check", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
      models: {
        contact: Model.extend({
          addresses: hasMany(),
        }),
        address: Model.extend({
          contact: belongsTo(),
        }),
      },
      serializers: {
        application: RestSerializer.extend({
          normalizeIds: true,
        }),
      },
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function () {
    server.shutdown();
  });

  test("a get shorthand works", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.get("/contacts");

    let res = await fetch("/contacts");
    let data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      contacts: [{ id: "1", name: "Link", addresses: [] }],
    });
  });

  test("a post shorthand works", async () => {
    expect.assertions(3);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.post("/addresses");

    let res = await fetch("/addresses", {
      method: "POST",
      body: JSON.stringify({
        address: {
          street: "5th ave",
          contact: 1,
        },
      }),
    });

    expect(res.status).toBe(201);
    expect(server.db.addresses).toHaveLength(1);
    expect(server.db.addresses[0].contactId).toBe(1);
  });

  test("a put shorthand works", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.put("/contacts/:id");

    let res = await fetch("/contacts/1", {
      method: "PUT",
      body: JSON.stringify({
        contact: {
          name: "Zelda",
        },
      }),
    });

    expect(res.status).toBe(200);
    expect(server.db.contacts[0].name).toBe("Zelda");
  });

  test("a patch shorthand works", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.patch("/contacts/:id");

    let res = await fetch("/contacts/1", {
      method: "PATCH",
      body: JSON.stringify({
        contact: {
          name: "Zelda",
        },
      }),
    });

    expect(res.status).toBe(200);
    expect(server.db.contacts[0].name).toBe("Zelda");
  });

  test("a delete shorthand works", async () => {
    expect.assertions(2);

    server.db.loadData({
      contacts: [{ id: 1, name: "Link" }],
    });

    server.del("/contacts/:id");

    let res = await fetch("/contacts/1", {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
    expect(server.db.contacts).toHaveLength(0);
  });
});
