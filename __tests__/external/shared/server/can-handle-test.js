import { Server } from "miragejs";

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

  test("it works for namespaces", () => {
    server.namespace = "api";
    server.get("/movies", () => {
      return [1, 2, 3];
    });

    expect(server.canHandle("get", "/api/movies")).toBeTrue();
    expect(server.canHandle("get", "/movies")).toBeFalse();
  });

  test("it works for urls on a different origin", () => {
    server.urlPrefix = "https://example.com";
    server.get("/movies", () => {
      return [1, 2, 3];
    });

    expect(server.canHandle("get", "https://example.com/movies")).toBeTrue();
    expect(server.canHandle("get", "/movies")).toBeFalse();
  });

  test("it works with dynamic segments", () => {
    server.get("/movies/:id", () => {
      return { id: 1 };
    });

    expect(server.canHandle("get", "/movies/1")).toBeTrue();
  });
});
