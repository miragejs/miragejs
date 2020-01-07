import { Server } from "miragejs";

describe("External | Shared | Server | middleware", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test"
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  it("adds stuff to the request", async () => {
    const middleware = request => {
      request.stuffAdded = { test: "hello from mw" };

      return request;
    };

    server.middlewares.pre = [middleware];

    server.get("/todos", (_, request) => {
      return request.stuffAdded;
    });

    const response = await fetch("/todos").then(r => r.json());

    expect(response.test).toBe("hello from mw");
  });

  it("adds stuff to the response", async () => {
    const middleware = (_, response) => {
      response.stuffAdded = "abcd";

      return response;
    };

    server.middlewares.post = [middleware];

    server.get("/todos", () => ({
      text: "hello"
    }));

    const response = await fetch("/todos", { method: "GET" }).then(r =>
      r.json()
    );

    expect(response.stuffAdded).toBe("abcd");
  });

  it("adds serializer to plaintext as a middleware", async () => {
    const middleware = request => {
      return request.queryParams.toTest;
    };

    server.middlewares.post = [middleware];

    server.get("/todos", () => ({
      text: "hello"
    }));

    const response = await fetch("/todos?toTest=abcd", {
      method: "GET"
    }).then(r => r.text());

    expect(response).toBe("abcd");
  });

  it("supports multiple pre middleares", async () => {
    const middlewareAdd1 = request => {
      request.params.id = parseInt(request.params.id, 10) + 1;
      return request;
    };

    const middlewareMultiply2 = request => {
      request.params.id = parseInt(request.params.id, 10) * 2;
      return request;
    };

    server.middlewares.pre = [middlewareAdd1, middlewareMultiply2];

    server.get("/todos/:id", (_, request) => request.params.id);

    const response = await fetch("/todos/2", {
      method: "GET"
    }).then(r => r.text());

    expect(response).toBe("6");
  });

  it("supports multiple post middlewares", async () => {
    const middlewareAdd1 = (_, response) => {
      response.id = parseInt(response.id, 10) + 1;
      return response;
    };

    const middlewareMultiply2 = (_, response) => {
      response.id = parseInt(response.id, 10) * 2;
      return response;
    };

    server.middlewares.post = [middlewareAdd1, middlewareMultiply2];

    server.get("/todos", () => ({
      id: 5
    }));

    const response = await fetch("/todos", {
      method: "GET"
    }).then(r => r.json());

    expect(response.id).toBe(12);
  });
});
