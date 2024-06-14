import { Server } from "miragejs";

describe("Integration | Server | Get full path", function () {
  let server;

  beforeEach(function () {
    server = new Server({
      environment: "test",
    });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("it works with a configured namespace with a leading slash", () => {
    expect.assertions(1);
    server.namespace = "/api";

    expect(server.interceptor._getFullPath("/contacts")).toBe("/api/contacts");
  });

  test("it works with a configured namespace with a trailing slash", () => {
    expect.assertions(1);
    server.namespace = "api/";

    expect(server.interceptor._getFullPath("/contacts")).toBe("/api/contacts");
  });

  test("it works with a configured namespace without a leading slash", () => {
    expect.assertions(1);
    server.namespace = "api";

    expect(server.interceptor._getFullPath("/contacts")).toBe("/api/contacts");
  });

  test("it works with a configured namespace is an empty string", () => {
    expect.assertions(1);
    server.namespace = "";

    expect(server.interceptor._getFullPath("/contacts")).toBe("/contacts");
  });

  test("it works with a configured urlPrefix with a trailing slash", () => {
    expect.assertions(1);
    server.urlPrefix = "http://localhost:3000/";

    expect(server.interceptor._getFullPath("/contacts")).toBe(
      "http://localhost:3000/contacts"
    );
  });

  test("it works with a configured urlPrefix without a trailing slash", () => {
    expect.assertions(1);
    server.urlPrefix = "http://localhost:3000";

    expect(server.interceptor._getFullPath("/contacts")).toBe(
      "http://localhost:3000/contacts"
    );
  });

  test("it works with a configured urlPrefix as an empty string", () => {
    expect.assertions(1);
    server.urlPrefix = "";

    expect(server.interceptor._getFullPath("/contacts")).toBe("/contacts");
  });

  test("it works with a configured namespace and a urlPrefix", () => {
    expect.assertions(1);
    server.namespace = "api";
    server.urlPrefix = "http://localhost:3000";

    expect(server.interceptor._getFullPath("/contacts")).toBe(
      "http://localhost:3000/api/contacts"
    );
  });

  test("it works with a configured namespace with a leading slash and a urlPrefix", () => {
    expect.assertions(1);
    server.namespace = "/api";
    server.urlPrefix = "http://localhost:3000";

    expect(server.interceptor._getFullPath("/contacts")).toBe(
      "http://localhost:3000/api/contacts"
    );
  });

  test("it works with a configured namespace and a urlPrefix as empty strings", () => {
    expect.assertions(1);
    server.namespace = "";
    server.urlPrefix = "";

    expect(server.interceptor._getFullPath("/contacts")).toBe("/contacts");
  });
});
