import { Server, Model } from "miragejs";

describe("External | Shared | ORM | attrs", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
    });

    server.db.loadData({
      users: [{ id: 1, name: "Link", evil: false }],
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("attrs returns the models attributes", () => {
    let user = server.schema.users.find(1);

    expect(user.attrs).toEqual({ id: "1", name: "Link", evil: false });
  });

  test("attributes can be read via plain property access", () => {
    let user = server.schema.users.find(1);

    expect(user.name).toBe("Link");
  });

  test("toJSON should return a copy of attrs so they cannot be mutated", () => {
    let user = server.schema.users.find(1);

    let json = user.toJSON();
    expect(json).toEqual({ id: "1", name: "Link", evil: false });

    json.name = "Young Link";
    expect(user.name).toBe("Link");
  });
});
