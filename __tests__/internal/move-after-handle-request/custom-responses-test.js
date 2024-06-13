import { Server, Response } from "miragejs";

describe("Integration | Server | Custom responses", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function () {
    server.shutdown();
  });

  test("GET to an empty Response defaults to 200 and an empty json object", async () => {
    server.get("/example", function () {
      return new Response();
    });

    let res = await fetch("/example");
    let data = await res.json();

    expect(data).toEqual({});
    expect(res.status).toBe(200);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"],
    ]);
  });

  test("GET to a 200 Response responds with an empty json object", async () => {
    server.get("/example", function () {
      return new Response(200);
    });

    let res = await fetch("/example");
    let data = await res.json();

    expect(data).toEqual({});
    expect(res.status).toBe(200);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"],
    ]);
  });

  test("a 204 Response responds with an empty body", async () => {
    server.post("/example", function () {
      return new Response(204);
    });

    let res = await fetch("/example", { method: "POST" });
    let text = await res.text();

    expect(text).toBe("");
    expect(res.status).toBe(204);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "text/plain;charset=UTF-8"],
    ]);
  });
});
