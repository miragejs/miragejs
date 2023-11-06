import { Server } from "miragejs";

async function asynchronousTask(cb) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cb());
    }, 0);
  });
}

describe("Integration | Middleware | async", () => {
  let server;

  afterEach(function () {
    server.shutdown();
  });

  test("await call BEFORE calling next()", async () => {
    const middlewareBefore = async (schema, req, next) => {
      await asynchronousTask(() => (req.queryParams.taskDone = "1"));
      return next();
    };

    server = new Server({
      environment: "test",
      routes() {
        this.middleware = [middlewareBefore];
        this.get("/path", (schema, req) => {
          return req.queryParams.taskDone ? "yay" : "boo";
        });
      },
    });

    let data = await fetch("/path").then((res) => res.text());
    expect(data).toEqual("yay");
  });

  test("await call AFTER calling next()", async () => {
    const middlewareAfter = async (schema, req, next) => {
      await next();
      return await asynchronousTask(() => "yay");
    };

    server = new Server({
      environment: "test",
      routes() {
        this.middleware = [middlewareAfter];
        this.get("/path", (schema, req) => {
          return "boo";
        });
      },
    });

    let data = await fetch("/path").then((res) => res.text());
    expect(data).toEqual("yay");
  });

  test("asynchronous callback BEFORE calling next()", async () => {
    const middleware = (schema, req, next) => {
      return asynchronousTask(
        () => (req.queryParams.fromMiddleware = "1")
      ).then(() => next());
    };

    server = new Server({
      environment: "test",
      routes() {
        this.middleware = [middleware];
        this.get("/path", (schema, req) => {
          return req.queryParams.fromMiddleware ? "yay" : "boo";
        });
      },
    });

    let data = await fetch("/path").then((res) => res.text());
    expect(data).toEqual("yay");
  });

  test("asynchronous callback AFTER calling next()", async () => {
    const middleware = (schema, req, next) => {
      next();
      return asynchronousTask(() => "yay");
    };

    server = new Server({
      environment: "test",
      routes() {
        this.middleware = [middleware];
        this.get("/path", (schema, req) => {
          return "boo";
        });
      },
    });

    let data = await fetch("/path").then((res) => res.text());
    expect(data).toEqual("yay");
  });
});
