import Response from 'ember-cli-mirage/response';

import {module, test} from 'qunit';

module('Unit | Response');

test('it can be instantiated and return a rack response', function(assert) {
  let response = new Response(404, {}, {});

  assert.ok(response);
  assert.ok(response.toRackResponse());
});

test('it can be instantiated with just a response code', function(assert) {
  let response = new Response(404);

  assert.ok(response);
  assert.ok(response.toRackResponse());
});
