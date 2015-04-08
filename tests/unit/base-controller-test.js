import baseController from 'ember-cli-mirage/controllers/base';

import {module, test} from 'qunit';

var controller, request;
module('mirage:base-controller#_getIdForRequest', {
  beforeEach: function() {
    controller = new baseController();
    request = { params: {id: ''} };
  }
});

test('it returns a number if it\'s a number', function(assert) {
  request.params.id = 2;
  assert.equal(controller._getIdForRequest(request), 2, 'it returns a number');
});

test('it returns a number if it\'s a string represented number', function(assert) {
  request.params.id = "2";
  assert.equal(controller._getIdForRequest(request), 2, 'it returns a number');
});

test('it returns a string it\'s a dasherized number', function(assert) {
  request.params.id = "2-1";
  assert.equal(controller._getIdForRequest(request), "2-1", 'it returns a number');
});

test('it returns a string if it\'s a string', function(assert) {
  request.params.id = "someID";
  assert.equal(controller._getIdForRequest(request), "someID", 'it returns a number');
});
