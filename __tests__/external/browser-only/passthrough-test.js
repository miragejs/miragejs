import { Server } from "miragejs";

describe("External | Browser only | Passthrough", () => {
  let server, originalError;

  beforeEach(() => {
    server = new Server({
      environment: "test",
    });

    /*
      Waiting to hear back on this:

        https://stackoverflow.com/questions/57227095/how-can-i-catch-or-suppress-a-rejected-network-request-from-jest

      For now, suppress console error messages
    */
    originalError = console.error;
    console.error = () => {};
  });

  afterEach(() => {
    server.shutdown();
    console.error = originalError;
  });

  test("it can passthrough individual paths", async () => {
    expect.assertions(2);

    server.loadConfig(function () {
      this.get("/contacts", function () {
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

    server.loadConfig(function () {
      this.get("/contacts", function () {
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

    server.loadConfig(function () {
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

    server.loadConfig(function () {
      this.get("/contacts", function () {
        return 123;
      });
      this.passthrough("/contacts", "/addresses");
    });

    await expect(fetch("/contacts")).rejects.toThrow("Network request failed");
    await expect(fetch("/addresses")).rejects.toThrow("Network request failed");
  });

  test("user can call passthrough multiple times", async () => {
    expect.assertions(2);

    server.loadConfig(function () {
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

    server.loadConfig(function () {
      this.get("/contacts", function () {
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

    server.loadConfig(function () {
      this.get("/contacts", function () {
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

    server.loadConfig(function () {
      this.passthrough("http://api.foo.bar/**");
    });

    await expect(fetch("http://api.foo.bar/addresses")).rejects.toThrow(
      "Network request failed"
    );
  });

  test("it can take a function", async () => {
    server.config({
      routes() {
        this.passthrough((request) => {
          return request.queryParams.skipMirage;
        });
      },
    });

    await expect(fetch("/users?skipMirage=true")).rejects.toThrow(
      "Network request failed"
    );

    await expect(fetch("/users")).rejects.toThrow(
      `Mirage: Your app tried to GET '/users'`
    );
  });

  test("it passes through common build tool-related paths", async () => {
    await expect(fetch("/abc.hot-update.json")).rejects.toThrow(
      "Network request failed"
    );
    await expect(fetch("/movies")).rejects.toThrow(
      `Mirage: Your app tried to GET '/movies'`
    );

    await expect(fetch("/def.hot-update.json")).rejects.toThrow(
      "Network request failed"
    );
    await expect(fetch("/movies")).rejects.toThrow(
      `Mirage: Your app tried to GET '/movies'`
    );
  });
});

test("a new server created with useDefaultPassthroughs set to false ignores default passthrougsh", async () => {
  let server = new Server({
    useDefaultPassthroughs: false,
  });

  await expect(fetch("/abc.hot-update.json")).rejects.toThrow(
    "Mirage: Your app tried to GET '/abc.hot-update.json'"
  );

  server.shutdown();
});
