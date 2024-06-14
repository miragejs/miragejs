import { Server, Model, ActiveModelSerializer, RestSerializer } from "miragejs";

describe("Integration | Server Config", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        contact: Model,
        post: Model,
      },
      serializers: {
        contact: ActiveModelSerializer,
      },
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function () {
    server.shutdown();
  });

  test("namespace can be configured", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.namespace = "api";
    server.get("/contacts");

    let res = await fetch("/api/contacts");
    let data = await res.json();
    expect(data).toEqual({ contacts });
  });

  test("urlPrefix can be configured", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.urlPrefix = "http://localhost:3000";
    server.get("/contacts");

    let res = await fetch("http://localhost:3000/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("urlPrefix and namespace can be configured simultaneously", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.urlPrefix = "http://localhost:3000";
    server.namespace = "api";
    server.get("/contacts");

    let res = await fetch("http://localhost:3000/api/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("fully qualified domain names can be used in configuration", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.get("http://example.org/api/contacts");

    let res = await fetch("http://example.org/api/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("urlPrefix/namespace are ignored when fully qualified domain names are used in configuration", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.urlPrefix = "https://example.net";
    server.get("http://example.org/api/contacts");

    let res = await fetch("http://example.org/api/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("blank urlPrefix and namespace ends up as /", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.namespace = "";
    server.urlPrefix = "";
    server.get("contacts");

    let res = await fetch("/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("namespace with no slash gets one", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.namespace = "api";
    server.get("contacts");

    let res = await fetch("/api/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("urlPrefix with no slash gets one", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.urlPrefix = "pre";
    server.get("contacts");

    let res = await fetch("/pre/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("namespace of / works", async () => {
    expect.assertions(1);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.db.loadData({
      contacts,
    });
    server.namespace = "/";
    server.get("contacts");

    let res = await fetch("/contacts");
    let data = await res.json();

    expect(data).toEqual({ contacts });
  });

  test("redefining options using the config method works", async () => {
    expect.assertions(5);

    let contacts = [
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
    ];
    server.config({
      namespace: "api",
      urlPrefix: "http://localhost:3000",
      timing: 1000,
      serializers: {
        post: RestSerializer,
      },
    });
    server.db.loadData({
      contacts,
    });
    server.get("contacts");

    expect(server.timing).toBe(1000);

    let res = await fetch("http://localhost:3000/api/contacts");
    let data = await res.json();
    expect(data).toEqual({ contacts });

    let serializerMap = server.serializerOrRegistry._serializerMap;

    expect(Object.keys(serializerMap)).toHaveLength(2);
    expect(serializerMap.contact).toEqual(ActiveModelSerializer);
    expect(serializerMap.post).toEqual(RestSerializer);
  });

  test("redefining timing options twice using the config method works", async () => {
    expect.assertions(2);

    server.config({
      timing: 1000,
    });

    expect(server.timing).toBe(1000);

    server.config({
      timing: 500,
    });

    expect(server.timing).toBe(500);
  });

  test("changing the environment of the server throws an error", () => {
    expect(() => {
      server.config({
        environment: "test",
      });
    }).toThrow();
  });

  test("changing the trackRequests configuration of the server throws an error", () => {
    expect(() => {
      server.config({
        trackRequests: true,
      });
    }).toThrow();
  });
});
