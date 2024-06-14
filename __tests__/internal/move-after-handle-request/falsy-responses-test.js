import { Server } from "miragejs";

describe("Integration | Server | Falsy responses", function () {
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

  test("undefined response returns an empty object", async () => {
    server.get("/example", function () {
      return undefined;
    });

    let res = await fetch("/example");
    let data = await res.json();

    expect(data).toEqual({});
    expect(res.status).toBe(200);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"],
    ]);
  });

  test("null response returns a JSON null", async () => {
    server.get("/example", function () {
      return null;
    });

    let res = await fetch("/example");
    let data = await res.json();

    expect(data).toBeNull();
    expect(res.status).toBe(200);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"],
    ]);
  });

  test("empty string response returns an empty object", async () => {
    server.get("/example", function () {
      return "";
    });

    let res = await fetch("/example");
    let data = await res.json();

    expect(data).toEqual({});
    expect(res.status).toBe(200);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"],
    ]);
  });

  test("empty object PUT response returns an empty object", async () => {
    server.put("/example", function () {
      return {};
    });

    let res = await fetch("/example", { method: "PUT" });
    let data = await res.json();

    expect(data).toEqual({});
    expect(res.status).toBe(200);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"],
    ]);
  });
});
