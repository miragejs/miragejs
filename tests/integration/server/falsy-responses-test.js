import { module, test } from "qunit";
import Server from "ember-cli-mirage/server";
import promiseAjax from "../../helpers/promise-ajax";

module("Integration | Server | Falsy responses", function(hooks) {
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

  test("undefined response returns an empty object", async function(assert) {
    this.server.get("/example", function() {
      return undefined;
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

  test("null response returns a JSON null", async function(assert) {
    this.server.get("/example", function() {
      return null;
    });

    let { data, xhr } = await promiseAjax({
      method: "GET",
      url: "/example"
    });

    assert.deepEqual(data, null);
    assert.equal(xhr.responseText, "null");
    assert.equal(xhr.status, 200);
    assert.equal(
      xhr.getAllResponseHeaders().trim(),
      "Content-Type: application/json"
    );
  });

  test("empty string response returns an empty object", async function(assert) {
    this.server.get("/example", function() {
      return "";
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

  test("empty object PUT response returns an empty object", async function(assert) {
    this.server.put("/example", function() {
      return {};
    });

    let { data, xhr } = await promiseAjax({
      method: "PUT",
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
});
