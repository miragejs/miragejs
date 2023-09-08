import { Response, Server, Model } from "miragejs";

describe("Integration | Middleware", () => {
  let server;

  afterEach(function () {
    server.shutdown();
  });

  describe("#middleware", () => {
    test("works and only applies to subsequent routes", async () => {
      function shortCircuitingMiddleware1() {
        return (schema, request, next) => "from first middleware";
      }

      function shortCircuitingMiddleware2() {
        return (schema, request, next) => "from second middleware";
      }

      server = new Server({
        environment: "test",
        models: {
          user: Model,
          frog: Model,
        },
        routes() {
          this.namespace = "api";

          this.middleware = [shortCircuitingMiddleware1()];
          this.get("/users");

          this.middleware = [shortCircuitingMiddleware2()];
          this.get("/frogs");
        },
      });

      server.createList("user", 3);

      let users = await fetch("/api/users").then((res) => res.text());
      let frogs = await fetch("/api/frogs").then((res) => res.text());

      expect(users).toEqual("from first middleware");
      expect(frogs).toEqual("from second middleware");
    });
  });

  describe("#withMiddleware", () => {
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
          this.namespace = "api";

          this.withMiddleware([shortCircuitingMiddleware()], () => {
            this.get("/users");
          });
        },
      });

      server.createList("user", 3);

      let data = await fetch("/api/users").then((res) => res.text());

      expect(data).toEqual("from middleware");
    });

    test("calls the route handler by calling next()", async () => {
      function noopMiddleware() {
        return (schema, request, next) => next();
      }

      server = new Server({
        environment: "test",
        models: {
          user: Model,
        },
        routes() {
          this.namespace = "api";

          this.withMiddleware([noopMiddleware()], () => {
            this.get("/users");
          });
        },
      });

      server.createList("user", 3);

      let data = await fetch("/api/users").then((res) => res.json());

      expect(data).toEqual({
        users: [{ id: "1" }, { id: "2" }, { id: "3" }],
      });
    });

    test("works with multiple middleware", async () => {
      function noopMiddleware() {
        return (schema, request, next) => next();
      }

      server = new Server({
        environment: "test",
        models: {
          user: Model,
        },
        routes() {
          this.namespace = "api";

          this.withMiddleware([noopMiddleware(), noopMiddleware()], () => {
            this.get("/users");
          });
        },
      });

      server.createList("user", 3);

      let data = await fetch("/api/users").then((res) => res.json());

      expect(data).toEqual({
        users: [{ id: "1" }, { id: "2" }, { id: "3" }],
      });
    });

    test("resets the middleware outside the block", async () => {
      function appendStringMiddleware(str) {
        return (schema, request, next) => {
          const response = next();
          const res =
            response instanceof Response
              ? response.toRackResponse()
              : [200, {}, response];
          return new Response(res[0], res[1], `${res[2]} ${str}`);
        };
      }

      server = new Server({
        environment: "test",
        models: {
          level0: Model,
          level1: Model,
          level2: Model,
        },
        routes() {
          this.namespace = "api";

          this.withMiddleware([appendStringMiddleware("A")], () => {
            this.withMiddleware([appendStringMiddleware("B")], () => {
              this.get("/level2", () => "level2 response");
            });

            this.get("/level1", () => "level1 response");
          });

          this.get("/level0", () => "level0 response");
        },
      });

      let data2 = await fetch("/api/level2").then((res) => res.text());
      expect(data2).toEqual("level2 response B A");

      let data1 = await fetch("/api/level1").then((res) => res.text());
      expect(data1).toEqual("level1 response A");

      let data0 = await fetch("/api/level0").then((res) => res.text());
      expect(data0).toEqual("level0 response");
    });
  });
});
