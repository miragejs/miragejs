import Response from "ember-cli-mirage/response";

import { module, test } from "qunit";

module("Unit | Response", function() {
  test("it can be instantiated and return a rack response", function(assert) {
    let response = new Response(404, {}, {});

    assert.ok(response);
    assert.ok(response.toRackResponse());
  });

  test("it can be instantiated with just a response code", function(assert) {
    let response = new Response(404);

    assert.ok(response);
    assert.ok(response.toRackResponse());
  });

  test("it adds Content-Type by default", function(assert) {
    let response = new Response(200, {}, {});

    assert.ok(response);
    assert.equal(response.headers["Content-Type"], "application/json");
  });

  test("it does not add Content-Type for a 204 response", function(assert) {
    let response = new Response(204);

    assert.ok(response);
    assert.notOk(response.headers["Content-Type"]);
  });
});
