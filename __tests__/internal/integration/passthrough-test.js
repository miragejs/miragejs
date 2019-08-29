import { Server } from "@miragejs/server";

describe("Integration | Passthrough", () => {
  let server, originalError;

  beforeEach(() => {
    server = new Server({
      environment: "development"
    });
    server.timing = 0;
    server.logging = false;

    /*
      Waiting to hear back on this:

        https://stackoverflow.com/questions/57227095/how-can-i-catch-or-suppress-a-rejected-network-request-from-jest

      For now, suppress console error messages
    */
    originalError = console.error;
    console.error = () => {};
  });

  afterEach(function() {
    server.shutdown();
    console.error = originalError;
  });

  test("it can passthrough individual paths", async () => {
    expect.assertions(2);

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough("/addresses");
    });

    let res = await fetch("/contacts");
    let data = await res.json();
    expect(data).toEqual(123);

    await expect(fetch("/addresses")).rejects.toThrow(`Network request failed`);
  });

  test("it can passthrough certain verbs for individual paths", async () => {
    expect.assertions(3);

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough("/addresses", ["post"]);
    });

    let res = await fetch("/contacts");
    let data = await res.json();
    expect(data).toEqual(123);

    await expect(fetch("/addresses")).rejects.toThrow(
      `Mirage: Your app tried to GET '/addresses', but there was no route defined to handle this request`
    );

    await expect(fetch("/addresses", { method: "POST" })).rejects.toThrow(
      `Network request failed`
    );
  });

  test("it can passthrough all verbs by default", async () => {
    let verbs = ["GET", "HEAD", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"];
    expect.assertions(7);

    server.loadConfig(function() {
      this.passthrough("/addresses");
    });

    for (let method of verbs) {
      await expect(fetch("/addresses", { method })).rejects.toThrow(
        "Network request failed"
      );
    }
  });

  test("it can passthrough multiple paths in a single call", async () => {
    expect.assertions(2);

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough("/contacts", "/addresses");
    });

    await expect(fetch("/contacts")).rejects.toThrow("Network request failed");
    await expect(fetch("/addresses")).rejects.toThrow("Network request failed");
  });

  test("user can call passthrough multiple times", async () => {
    expect.assertions(2);

    server.loadConfig(function() {
      this.passthrough("/contacts");
      this.passthrough("/addresses", ["post"]);
    });

    await expect(fetch("/contacts")).rejects.toThrow("Network request failed");
    await expect(fetch("/addresses", { method: "POST" })).rejects.toThrow(
      "Network request failed"
    );
  });

  test("passthrough without args allows all paths on the current domain to passthrough", async () => {
    expect.assertions(2);

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough();
    });

    let res = await fetch("/contacts");
    let data = await res.json();
    expect(data).toEqual(123);

    await expect(fetch("/addresses")).rejects.toThrow("Network request failed");
  });

  test("passthrough without args allows index route on current domain to passthrough", async () => {
    expect.assertions(2);

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough();
    });

    let res = await fetch("/contacts");
    let data = await res.json();
    expect(data).toEqual(123);

    await expect(fetch("/")).rejects.toThrow("Network request failed");
  });

  test("it can passthrough other-origin hosts", async () => {
    expect.assertions(1);

    server.loadConfig(function() {
      this.passthrough("http://api.foo.bar/**");
    });

    await expect(fetch("http://api.foo.bar/addresses")).rejects.toThrow(
      "Network request failed"
    );
  });
});
