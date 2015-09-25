import BaseShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/base';

import {module, test} from 'qunit';

module('Unit | Route handlers | Shorthands | BaseShorthandRouteHandler', {
  beforeEach: function() {
    this.handler = new BaseShorthandRouteHandler();
    this.request = { params: {id: ''} };
  }
});

test('it returns a number if it\'s a number', function(assert) {
  this.request.params.id = 2;
  assert.equal(this.handler._getIdForRequest(this.request), 2, 'it returns a number');
});

test('it returns a number if it\'s a string represented number', function(assert) {
  this.request.params.id = "2";
  assert.equal(this.handler._getIdForRequest(this.request), 2, 'it returns a number');
});

test('it returns a string it\'s a dasherized number', function(assert) {
  this.request.params.id = "2-1";
  assert.equal(this.handler._getIdForRequest(this.request), "2-1", 'it returns a number');
});

test('it returns a string if it\'s a string', function(assert) {
  this.request.params.id = "someID";
  assert.equal(this.handler._getIdForRequest(this.request), "someID", 'it returns a number');
});

test('url without id returns correct type', function (assert) {
  var urlWithSlash = '/api/users/?test=true';
  var urlWithoutSlash = '/api/users?test=true';

  assert.equal(this.handler._getTypeFromUrl(urlWithSlash), 'user', 'it returns a singular type');
  assert.equal(this.handler._getTypeFromUrl(urlWithoutSlash), 'user', 'it returns a singular type');
});
