import { Server, Model } from "miragejs";

describe("External | Shared | ORM | #findOrCreateBy", () => {
  let User;
  let server;

  beforeEach(() => {
    User = Model;
    server = new Server({
      environment: "test",
      models: {
        user: User,
      },
    });

    server.db.loadData({
      users: [
        { id: 1, name: "Link", good: true },
        { id: 2, name: "Zelda", good: true },
        { id: 3, name: "Ganon", good: false },
      ],
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it returns the first model that matches the attrs", () => {
    let user = server.schema.users.findOrCreateBy({ good: true });

    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link", good: true });
  });

  test("it creates a model if no existing model with the attrs is found", () => {
    expect(server.schema.db.users).toHaveLength(3);

    let newUser = server.schema.users.findOrCreateBy({
      name: "Link",
      good: false,
    });

    expect(server.schema.db.users).toHaveLength(4);
    expect(newUser instanceof User).toBeTruthy();
    expect(newUser.attrs).toEqual({ id: "4", name: "Link", good: false });
  });
});
