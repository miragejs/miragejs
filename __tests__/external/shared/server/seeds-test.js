import { Server, Model } from "miragejs";

describe("External | Shared | Server | seeds", () => {
  let server;

  afterEach(function () {
    server.shutdown();
  });

  test("seeds config option works", async () => {
    server = new Server({
      models: {
        user: Model,
      },
      seeds(server) {
        server.createList("user", 3);
      },
    });

    expect(server.db.dump()).toEqual({
      users: [{ id: "1" }, { id: "2" }, { id: "3" }],
    });
  });

  test("there's an error if both scenarios default and seeds options are passed in", async () => {
    expect(() => {
      new Server({
        environment: "test",
        seeds(server) {
          server.create("user");
        },
        scenarios: {
          default(server) {
            server.create("user");
          },
        },
      });
    }).toThrow(
      "The seeds option is an alias for the scenarios.default option. You can't pass both options into your server definition."
    );
  });
});
