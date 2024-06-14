import { Server, Model, Collection } from "miragejs";

describe("External | Shared | ORM | #all", function () {
  let User;
  let server;

  beforeEach(() => {
    User = Model.extend();
    server = new Server({
      environment: "test",
      models: {
        user: User,
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it can return all models", () => {
    server.db.loadData({
      users: [
        { id: 1, name: "Link" },
        { id: 2, name: "Zelda" },
      ],
    });

    let users = server.schema.users.all();

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models).toHaveLength(2);
    expect(users.models[1].attrs).toEqual({ id: "2", name: "Zelda" });
  });

  test("it returns an empty array when no models exist", () => {
    let users = server.schema.users.all();

    expect(users instanceof Collection).toBeTruthy();
    expect(users.modelName).toBe("user");
    expect(users.models).toHaveLength(0);
  });
});
