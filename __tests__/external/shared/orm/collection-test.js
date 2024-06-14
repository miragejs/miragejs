import { Server, Model, Collection } from "miragejs";

describe("External | Shared | ORM | collection", () => {
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
        { id: 1, name: "Link", good: true },
        { id: 2, name: "Zelda", good: true },
        { id: 3, name: "Ganon", good: false },
      ],
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("a collection can save its models", () => {
    let collection = server.schema.users.all();
    collection.models[0].name = "Sam";
    collection.save();

    expect(server.db.users[0]).toEqual({ id: "1", name: "Sam", good: true });
  });

  test("a collection can reload its models", () => {
    let collection = server.schema.users.all();
    expect(collection.models[0].name).toBe("Link");

    collection.models[0].name = "Sam";
    expect(collection.models[0].name).toBe("Sam");

    collection.reload();
    expect(collection.models[0].name).toBe("Link");
  });

  test("a collection can filter its models", () => {
    let collection = server.schema.users.all();
    expect(collection.models).toHaveLength(3);

    let newCollection = collection.filter((author) => author.good);

    expect(newCollection instanceof Collection).toBeTruthy();
    expect(newCollection.modelName).toBe("user");
    expect(newCollection.models).toHaveLength(2);
  });

  test("a collection can sort its models", () => {
    let collection = server.schema.users.all();
    expect(collection.models.map((m) => m.name)).toEqual([
      "Link",
      "Zelda",
      "Ganon",
    ]);

    let newCollection = collection.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    expect(newCollection instanceof Collection).toBeTruthy();
    expect(newCollection.modelName).toBe("user");
    expect(newCollection.models.map((m) => m.name)).toEqual([
      "Ganon",
      "Link",
      "Zelda",
    ]);
  });

  test("a collection can slice its models", () => {
    let collection = server.schema.users.all();
    expect(collection.models.map((m) => m.name)).toEqual([
      "Link",
      "Zelda",
      "Ganon",
    ]);

    let newCollection = collection.slice(-2);

    expect(newCollection instanceof Collection).toBeTruthy();
    expect(newCollection.modelName).toBe("user");
    expect(newCollection.models.map((m) => m.name)).toEqual(["Zelda", "Ganon"]);
  });

  test("a collection can merge with another collection", () => {
    let goodGuys = server.schema.users.where((user) => user.good);
    let badGuys = server.schema.users.where((user) => !user.good);

    expect(goodGuys.models).toHaveLength(2);
    expect(badGuys.models).toHaveLength(1);

    goodGuys.mergeCollection(badGuys);

    expect(goodGuys.models).toHaveLength(3);
  });
});
