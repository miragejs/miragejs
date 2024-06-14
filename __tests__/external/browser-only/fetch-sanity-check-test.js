import { Server, Model } from "miragejs";

describe("External |Browser only | Fetch sanity check", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        contact: Model,
      },
    });
  });

  afterEach(() => {
    server.shutdown();
  });

  test("mirage responds to get", async () => {
    expect.assertions(1);

    server.get("/contacts", function () {
      return { some: "data" };
    });

    let res = await fetch("/contacts", { method: "GET" });
    let data = await res.json();

    expect(data).toEqual({ some: "data" });
  });

  test("mirage responds to post", async () => {
    expect.assertions(1);

    server.post("/contacts", function () {
      return { some: "data" };
    });

    let res = await fetch("/contacts", {
      method: "POST",
    });
    let data = await res.json();

    expect(data).toEqual({ some: "data" });
  });

  test("mirage responds to put", async () => {
    expect.assertions(1);

    server.put("/contacts", function () {
      return { some: "data" };
    });

    let res = await fetch("/contacts", {
      method: "PUT",
      url: "/contacts",
    });
    let data = await res.json();

    expect(data).toEqual({ some: "data" });
  });

  test("mirage responds to delete", async () => {
    expect.assertions(1);

    server.delete("/contacts", function () {
      return { some: "data" };
    });

    let res = await fetch("/contacts", {
      method: "DELETE",
      url: "/contacts",
    });
    let data = await res.json();

    expect(data).toEqual({ some: "data" });
  });

  test("mirage responds to patch", async () => {
    expect.assertions(1);

    server.patch("/contacts", function () {
      return { some: "data" };
    });

    let res = await fetch("/contacts", {
      method: "PATCH",
    });
    let data = await res.json();

    expect(data).toEqual({ some: "data" });
  });

  test("mirage responds to resource", async () => {
    expect.assertions(1);

    server.resource("contacts");

    let res = await fetch("/contacts", { method: "GET" });
    let data = await res.json();

    expect(data).toEqual({ contacts: [] });
  });

  test("response code can be customized", async () => {
    expect.assertions(1);

    server.get("/contacts", {}, 404);

    let res = await fetch("/contacts", {
      method: "GET",
    });

    expect(res.status).toBe(404);
  });

  test("mirage responds to options", async () => {
    expect.assertions(1);

    server.options("/contacts", function () {
      return { some: "data" };
    });

    let res = await fetch("/contacts", {
      method: "OPTIONS",
    });
    let data = await res.json();

    expect(data).toEqual({ some: "data" });
  });
});
