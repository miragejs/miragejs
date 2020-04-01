import { Server, Model } from "miragejs";

describe("External | Shared | ORM | create", () => {
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

  test("it cannot make new models that havent been registered", () => {
    expect(function () {
      server.schema.authors.new({ name: "Link" });
    }).toThrow();
  });

  test("it cannot create models that havent been registered", () => {
    expect(function () {
      server.schema.authors.create({ name: "Link" });
    }).toThrow();
  });

  test("it can make new models and then save them", () => {
    let user = server.schema.users.new({ name: "Link" });

    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ name: "Link" });
    expect(server.db.users).toBeEmpty();

    user.save();

    expect(user.id).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
    expect(server.db.users).toIncludeSameMembers([{ id: "1", name: "Link" }]);
  });

  test("it can create new models, saved directly to the db", () => {
    let user = server.schema.users.create({ name: "Link" });

    expect(user instanceof Model).toBeTruthy();
    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
    expect(server.db.users).toIncludeSameMembers([{ id: "1", name: "Link" }]);
  });
});
