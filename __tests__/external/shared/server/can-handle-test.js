import { Server } from "@miragejs/server";

describe("External | Shared | Server | canHandle", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test"
    });
  });

  afterEach(function() {
    server.shutdown();
  });

  test("its true when a route is defined", () => {
    server.get("/movies", () => {
      return [1, 2, 3];
    });

    expect(server.canHandle("get", "/movies")).toBeTrue();
  });

  test("its false when a route is not defined", () => {
    expect(server.canHandle("get", "/movies")).toBeFalse();
  });
});
