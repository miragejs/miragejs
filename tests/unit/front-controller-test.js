import frontController from 'ember-cli-mirage/controllers/front';

import {module, test} from 'qunit';

var controller, request;
module('mirage:front-controller');

test('its default response is 204 if the verb is put', function(assert) {
  var response = frontController.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 201 if the verb is post', function(assert) {
  var response = frontController.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 204 if the verb is delete', function(assert) {
  var response = frontController.handle('delete', {});
  assert.equal(response[0], 204);
});
