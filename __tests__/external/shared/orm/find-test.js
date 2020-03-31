import { Server, Model, Collection } from "miragejs";

describe("External | Shared | ORM | #find", () => {
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

    server.db.loadData({
      users: [
        { id: 1, name: "Link" },
        { id: 2, name: "Zelda" },
      ],
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("it can find a model by id", () => {
    let zelda = server.schema.users.find(2);

    expect(zelda instanceof User).toBeTruthy();
    expect(zelda.attrs).toEqual({ id: "2", name: "Zelda" });
  });

  test("it returns null if no model is found for an id", () => {
    let user = server.schema.users.find(4);

    expect(user).toBeNull();
  });

  test("it can find multiple models by ids", () => {
    let users = server.schema.users.find([1, 2]);

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models).toHaveLength(2);
    expect(users.models[1].attrs).toEqual({ id: "2", name: "Zelda" });
  });

  test("it errors if incorrect number of models are found for an array of ids", () => {
    expect(function () {
      server.schema.users.find([1, 6]);
    }).toThrow();
  });
});
