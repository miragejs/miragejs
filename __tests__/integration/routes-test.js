import { Server, Model } from "@miragejs/server";

describe("Integration | Server Config", () => {
  let server;

  afterEach(function() {
    server.shutdown();
  });

  test("routes config option works", async () => {
    server = new Server({
      environment: "test",
      models: {
        user: Model
      },
      routes() {
        this.namespace = "api";

        this.get("/users");
      }
    });

    server.createList("user", 3);

    let data = await fetch("/api/users").then(res => res.json());

    expect(data).toEqual({
      users: [{ id: "1" }, { id: "2" }, { id: "3" }]
    });
  });

  test("there's an error if both baseConfig and routes options are passed in", async () => {
    expect(() => {
      new Server({
        environment: "test",
        routes() {
          this.get("/users", () => ({ users: [] }));
        },
        baseConfig() {
          this.get("/posts", () => ({ posts: [] }));
        }
      });
    }).toThrow("You can't pass both options into your server definition");
  });
});
