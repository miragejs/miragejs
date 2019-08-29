import { Server } from "@miragejs/server";

describe("Public | Node only | Interceptor", () => {
  test("newing a server with various interceptor config works in node", () => {
    let server = new Server({
      environment: "test",
      routes() {
        this.namespace = "api";

        this.get("/users");

        this.passthrough();
      }
    });

    server.timing = 1000;

    expect(server).toBeTruthy();

    server.shutdown();
  });
});
