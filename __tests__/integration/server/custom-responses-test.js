
import Server from "@lib/server";
import promiseAjax from "../../helpers/promise-ajax";
import { Response } from "@miragejs/server";

describe("Integration | Server | Custom responses", function() {
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

  test("GET to an empty Response defaults to 200 and an empty json object", async () => {
    this.server.get("/example", function() {
      return new Response();
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

  test("GET to a 200 Response responds with an empty json object", async () => {
    this.server.get("/example", function() {
      return new Response(200);
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

  test("a 204 Response responds with an empty body", async () => {
    this.server.post("/example", function() {
      return new Response(204);
    });

    let { data, xhr } = await promiseAjax({
      method: "POST",
      url: "/example"
    });

    expect(data).toEqual(undefined);
    expect(xhr.responseText).toEqual("");
    expect(xhr.status).toEqual(204);
    expect(xhr.getAllResponseHeaders().trim()).toEqual("");
  });
});
