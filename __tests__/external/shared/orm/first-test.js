import { Server, Model } from "miragejs";

describe("External | Shared | ORM | #first", () => {
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

  test("it can find the first model", () => {
    let user = server.schema.users.first();

    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
  });
});
