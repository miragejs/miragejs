import { Server } from "@miragejs/server";

describe("Browser | Sample fetch", function() {
  let server;

  beforeEach(function() {
    server = new Server({
      environment: "test",
      baseConfig() {
        this.get("/users", function(schema, request) {
          return [{ id: 1, name: "bob" }];
        });
      }
    });
  });

  afterEach(function() {
    server.shutdown();
  });

  test("a fetch works", async () => {
    let res = await fetch("/users");
    let json = await res.json();

    expect(res.status).toEqual(200);
    expect(json).toHaveLength(1);
    expect(json[0].name).toEqual("bob");
  });
});
