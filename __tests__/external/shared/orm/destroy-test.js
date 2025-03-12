import { Server, Model } from "miragejs";

describe("External | Shared | ORM | destroy", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
    });

    server.db.loadData({
      users: [
        { id: 1, name: "Link", evil: false },
        { id: 2, name: "Link", location: "Hyrule", evil: false },
        { id: 3, name: "Zelda", location: "Hyrule", evil: false },
      ],
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("destroying a model removes the associated record from the db", () => {
    expect(server.db.users).toHaveLength(3);

    let link = server.schema.users.find(1);
    link.destroy();

    expect(server.db.users.find(1)).toBeNull();
    expect(server.db.users).toHaveLength(2);
  });

  test("destroying a model marks id as unused and allows creating a new model with same id", () => {
    expect(server.db.users).toHaveLength(3);

    let link = server.schema.users.find(1);
    link.destroy();

    server.schema.users.create({ id: 1, name: "Ganon", evil: true });
    const ganon = server.schema.users.find(1);

    expect(ganon).not.toBeNull();
    expect(ganon?.name).toBe("Ganon");
    expect(server.db.users).toHaveLength(3);
  });

  test("destroying a collection removes the associated records from the db", () => {
    expect(server.db.users).toHaveLength(3);

    let users = server.schema.users.all();
    users.destroy();

    expect(server.db.users).toBeEmpty();
  });
});
