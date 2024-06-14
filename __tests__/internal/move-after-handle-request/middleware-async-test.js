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
    expect(data).toBe("yay");
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
    expect(data).toBe("yay");
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
    expect(data).toBe("yay");
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
    expect(data).toBe("yay");
  });

  test("mixing async/await and callback-based middleware", async () => {
    const asyncMiddleware = (number) => {
      return async (schema, req, next) => {
        await asynchronousTask(() => {
          req.queryParams.tasks ||= [];
          req.queryParams.tasks.push(number);
        });
        const res = await next();
        res.push(number * 10);
        return res;
      };
    };

    const syncMiddleware = (number) => {
      const promisify = (cb) => (async () => cb())();

      return (schema, req, next) => {
        req.queryParams.tasks ||= [];
        req.queryParams.tasks.push(number);
        return promisify(() => next()).then((res) => {
          res.push(number * 10);
          return res;
        });
      };
    };

    server = new Server({
      environment: "test",
      routes() {
        this.middleware = [
          asyncMiddleware(1),
          syncMiddleware(2),
          asyncMiddleware(3),
          syncMiddleware(4),
        ];
        this.get("/path", (schema, req) => {
          return req.queryParams.tasks;
        });
      },
    });

    let data = await fetch("/path").then((res) => res.json());
    expect(data).toEqual([1, 2, 3, 4, 40, 30, 20, 10]);
  });
});
