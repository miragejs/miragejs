import { Server, Response } from "@miragejs/server";

describe("Integration | Server | Route handler errors", function() {
  let server;

  beforeEach(function() {
    server = new Server({
      environment: "test"
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function() {
    server.shutdown();
  });

  test("Throwing an error in a route handler results in an Internal Server Error", async () => {
    server.get("/example", function() {
      throw new Error('foo');
    });

    let res = await fetch("/example");
    let data = await res.json();

    expect(data.message).toEqual("foo");
    expect(data.stack).toContain("Mirage: Your GET handler for the url /example threw an error:\n\nError: foo");
    expect(res.status).toEqual(500);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"]
    ]);
  });

  test("Throwing a `Response` in a route handler results in the `Response` being returned", async () => {
    server.get("/example", function() {
      throw new Response(401, {}, { message: "Not Authenticated" });
    });

    let res = await fetch("/example");
    let data = await res.json();

    expect(data.message).toEqual("Not Authenticated");
    expect(data.stack).toBeFalsy();
    expect(res.status).toEqual(401);
    expect([...res.headers.entries()]).toEqual([
      ["content-type", "application/json"]
    ]);
  });
});
