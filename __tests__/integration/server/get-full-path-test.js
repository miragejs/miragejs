
import Server from "@lib/server";

describe("Integration | Server | Get full path", function() {
  beforeEach(function() {
    this.server = new Server({
      environment: "test"
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  afterEach(function() {
    this.server.shutdown();
  });

  test("it works with a configured namespace with a leading slash", () => {
    expect.assertions(1);
    let { server } = this;
    server.namespace = "/api";

    expect(server._getFullPath("/contacts")).toEqual("/api/contacts");
  });

  test("it works with a configured namespace with a trailing slash", () => {
    expect.assertions(1);
    let { server } = this;
    server.namespace = "api/";

    expect(server._getFullPath("/contacts")).toEqual("/api/contacts");
  });

  test("it works with a configured namespace without a leading slash", () => {
    expect.assertions(1);
    let { server } = this;
    server.namespace = "api";

    expect(server._getFullPath("/contacts")).toEqual("/api/contacts");
  });

  test("it works with a configured namespace is an empty string", () => {
    expect.assertions(1);
    let { server } = this;
    server.namespace = "";

    expect(server._getFullPath("/contacts")).toEqual("/contacts");
  });

  test("it works with a configured urlPrefix with a trailing slash", () => {
    expect.assertions(1);
    let { server } = this;
    server.urlPrefix = "http://localhost:3000/";

    expect(server._getFullPath("/contacts")).toEqual("http://localhost:3000/contacts");
  });

  test("it works with a configured urlPrefix without a trailing slash", () => {
    expect.assertions(1);
    let { server } = this;
    server.urlPrefix = "http://localhost:3000";

    expect(server._getFullPath("/contacts")).toEqual("http://localhost:3000/contacts");
  });

  test("it works with a configured urlPrefix as an empty string", () => {
    expect.assertions(1);
    let { server } = this;
    server.urlPrefix = "";

    expect(server._getFullPath("/contacts")).toEqual("/contacts");
  });

  test("it works with a configured namespace and a urlPrefix", () => {
    expect.assertions(1);
    let { server } = this;
    server.namespace = "api";
    server.urlPrefix = "http://localhost:3000";

    expect(server._getFullPath("/contacts")).toEqual("http://localhost:3000/api/contacts");
  });

  test("it works with a configured namespace with a leading slash and a urlPrefix", () => {
    expect.assertions(1);
    let { server } = this;
    server.namespace = "/api";
    server.urlPrefix = "http://localhost:3000";

    expect(server._getFullPath("/contacts")).toEqual("http://localhost:3000/api/contacts");
  });

  test("it works with a configured namespace and a urlPrefix as empty strings", () => {
    expect.assertions(1);
    let { server } = this;
    server.namespace = "";
    server.urlPrefix = "";

    expect(server._getFullPath("/contacts")).toEqual("/contacts");
  });
});
