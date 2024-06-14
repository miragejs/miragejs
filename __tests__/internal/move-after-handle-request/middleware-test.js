import { Server, Model } from "miragejs";

describe("Integration | Middleware", () => {
  let server;

  afterEach(function () {
    server.shutdown();
  });

  test("short-circuits by returning without calling next()", async () => {
    function shortCircuitingMiddleware() {
      return () => "from middleware";
    }

    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
      routes() {
        this.middleware = [shortCircuitingMiddleware()];
        this.get("/users");
      },
    });

    let data = await fetch("/users").then((res) => res.text());

    expect(data).toBe("from middleware");
  });

  test("invokes the route handler by calling next()", async () => {
    function noopMiddleware() {
      return (schema, req, next) => next();
    }

    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
      routes() {
        this.middleware = [noopMiddleware()];
        this.get("/users");
      },
    });

    server.createList("user", 3);

    let data = await fetch("/users").then((res) => res.json());

    expect(data).toEqual({
      users: [{ id: "1" }, { id: "2" }, { id: "3" }],
    });
  });

  test("works with multiple middleware", async () => {
    function noopMiddleware() {
      return (schema, req, next) => next(req);
    }

    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
      routes() {
        this.middleware = [noopMiddleware(), noopMiddleware()];
        this.get("/users");
      },
    });

    server.createList("user", 3);

    let data = await fetch("/users").then((res) => res.json());

    expect(data).toEqual({
      users: [{ id: "1" }, { id: "2" }, { id: "3" }],
    });
  });

  test("only applies to subsequent routes", async () => {
    function shortCircuitingMiddleware1() {
      return (schema, req, next) => "from first middleware";
    }

    function shortCircuitingMiddleware2() {
      return (schema, req, next) => "from second middleware";
    }

    server = new Server({
      environment: "test",
      models: {
        user: Model,
        frog: Model,
      },
      routes() {
        this.middleware = [shortCircuitingMiddleware1()];
        this.get("/users");

        this.middleware = [shortCircuitingMiddleware2()];
        this.get("/frogs");
      },
    });

    server.createList("user", 3);

    let users = await fetch("/users").then((res) => res.text());
    let frogs = await fetch("/frogs").then((res) => res.text());

    expect(users).toBe("from first middleware");
    expect(frogs).toBe("from second middleware");
  });

  test("can pass different request objects down the line", async () => {
    const requestFromMiddleware1 = { fakeRequest: "from middleware1" };
    const requestFromMiddleware2 = { fakeRequest: "from middleware2" };
    let requestReceivedByMiddleware2;
    let requestReceivedByRouteHandler;

    server = new Server({
      environment: "test",
      models: {
        user: Model,
      },
      routes() {
        this.middleware = [
          (schema, req, next) => {
            return next(requestFromMiddleware1);
          },
          (schema, req, next) => {
            requestReceivedByMiddleware2 = req;
            return next(requestFromMiddleware2);
          },
          (schema, req, next) => {
            // This middleware intentionally doesn't pass a Request into `next`.
            // The prior Request object is expected to make it through to the
            // next handler.
            return next();
          },
        ];
        this.get("/users", (schema, req) => {
          requestReceivedByRouteHandler = req;
          return { done: true };
        });
      },
    });

    await fetch("/users").then((res) => res.json());

    expect(requestReceivedByMiddleware2).toEqual(requestFromMiddleware1);
    expect(requestReceivedByRouteHandler).toEqual(requestFromMiddleware2);
  });
});
