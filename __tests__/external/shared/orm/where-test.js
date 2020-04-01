import { Server, Model, Collection } from "miragejs";

describe("External | Shared | ORM | #where", () => {
  let server;
  let User;

  beforeEach(() => {
    User = Model.extend();
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

  test("it returns models that match a query with where", () => {
    let users = server.schema.users.where({ good: false });

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(1);
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models[0].attrs).toEqual({
      id: "3",
      name: "Ganon",
      good: false,
    });
  });

  test("it returns models that match using a query function", () => {
    let users = server.schema.users.where(function (rec) {
      return !rec.good;
    });

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(1);
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models[0].attrs).toEqual({
      id: "3",
      name: "Ganon",
      good: false,
    });
  });

  test("it returns an empty collection if no models match a query", () => {
    let users = server.schema.users.where({ name: "Link", good: false });

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(0);
  });
});
