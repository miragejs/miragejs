
import Server from "@lib/server";
import promiseAjax from "../../helpers/promise-ajax";

describe("Integration | Server | Falsy responses", function() {
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

  test("undefined response returns an empty object", async () => {
    this.server.get("/example", function() {
      return undefined;
    });

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/example"
    });

    expect(data).toEqual({});
    expect(xhr.responseText).toEqual("{}");
    expect(xhr.status).toEqual(200);
    expect(xhr.getAllResponseHeaders().trim()).toEqual("Content-Type: application/json");
  });

  test("null response returns a JSON null", async () => {
    this.server.get("/example", function() {
      return null;
    });

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/example"
    });

    expect(data).toEqual(null);
    expect(xhr.responseText).toEqual("null");
    expect(xhr.status).toEqual(200);
    expect(xhr.getAllResponseHeaders().trim()).toEqual("Content-Type: application/json");
  });

  test("empty string response returns an empty object", async () => {
    this.server.get("/example", function() {
      return "";
    });

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/example"
    });

    expect(data).toEqual({});
    expect(xhr.responseText).toEqual("{}");
    expect(xhr.status).toEqual(200);
    expect(xhr.getAllResponseHeaders().trim()).toEqual("Content-Type: application/json");
  });

  test("empty object PUT response returns an empty object", async () => {
    this.server.put("/example", function() {
      return {};
    });

    let { data, xhr } = await promiseAjax({
      method: "PUT",
      url: "/example"
    });

    expect(data).toEqual({});
    expect(xhr.responseText).toEqual("{}");
    expect(xhr.status).toEqual(200);
    expect(xhr.getAllResponseHeaders().trim()).toEqual("Content-Type: application/json");
  });
});
