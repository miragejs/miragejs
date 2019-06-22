import { module, test } from "qunit";
import Server from "ember-cli-mirage/server";
import promiseAjax from "../../helpers/promise-ajax";
import { Response } from "ember-cli-mirage";

module("Integration | Server | Custom responses", function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: "test"
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test("GET to an empty Response defaults to 200 and an empty json object", async function(assert) {
    this.server.get("/example", function() {
      return new Response();
    });

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/example"
    });

    assert.deepEqual(data, {});
    assert.equal(xhr.responseText, "{}");
    assert.equal(xhr.status, 200);
    assert.equal(
      xhr.getAllResponseHeaders().trim(),
      "Content-Type: application/json"
    );
  });

  test("GET to a 200 Response responds with an empty json object", async function(assert) {
    this.server.get("/example", function() {
      return new Response(200);
    });

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/example"
    });

    assert.deepEqual(data, {});
    assert.equal(xhr.responseText, "{}");
    assert.equal(xhr.status, 200);
    assert.equal(
      xhr.getAllResponseHeaders().trim(),
      "Content-Type: application/json"
    );
  });

  test("a 204 Response responds with an empty body", async function(assert) {
    this.server.post("/example", function() {
      return new Response(204);
    });

    let { data, xhr } = await promiseAjax({
      method: "POST",
      url: "/example"
    });

    assert.deepEqual(data, undefined);
    assert.equal(xhr.responseText, "");
    assert.equal(xhr.status, 204);
    assert.equal(xhr.getAllResponseHeaders().trim(), "");
  });
});
