import { Server } from "miragejs";

describe("External |Node only | Interceptor", () => {
  test("newing a server with various interceptor config works in node", () => {
    let server = new Server({
      environment: "test",
      routes() {
        this.namespace = "api";

        this.resource("user");

        this.passthrough();
      },
    });

    server.timing = 1000;

    expect(server).toBeTruthy();

    server.shutdown();
  });
});
