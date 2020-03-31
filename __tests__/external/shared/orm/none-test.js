import { Server, Model, Collection } from "miragejs";

describe("External | Shared | ORM | #none", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
    });

    server.db.loadData({
      user: [
        { id: 1, name: "Link", good: true },
        { id: 2, name: "Zelda", good: true },
        { id: 3, name: "Ganon", good: false },
      ],
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it returns an empty collection", () => {
    let users = server.schema.users.none();

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(0);
  });
});
