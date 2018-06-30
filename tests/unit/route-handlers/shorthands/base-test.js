import BaseShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/base';

import {module, test} from 'qunit';

module('Unit | Route handlers | Shorthands | BaseShorthandRouteHandler', function(hooks) {
  hooks.beforeEach(function() {
    this.handler = new BaseShorthandRouteHandler();
    this.request = { params: { id: '' } };
  });

  test('it returns a number if it\'s a number', function(assert) {
    this.request.params.id = 2;
    assert.equal(this.handler._getIdForRequest(this.request), 2, 'it returns a number');
  });

  test('it returns a number if it\'s a string represented number', function(assert) {
    this.request.params.id = '2';
    assert.equal(this.handler._getIdForRequest(this.request), 2, 'it returns a number');
  });

  test('it returns a string it\'s a dasherized number', function(assert) {
    this.request.params.id = '2-1';
    assert.equal(this.handler._getIdForRequest(this.request), '2-1', 'it returns a number');
  });

  test('it returns a string if it\'s a string', function(assert) {
    this.request.params.id = 'someID';
    assert.equal(this.handler._getIdForRequest(this.request), 'someID', 'it returns a number');
  });

  test('getModelClassFromPath works with various named route path variable', function(assert) {
    let urlWithSlash = '/api/fancy-users';
    let urlWithIdAndSlash = '/api/fancy-users/:id';

    assert.equal(this.handler.getModelClassFromPath(urlWithSlash), 'fancy-user', 'it returns a singular model name');
    assert.equal(this.handler.getModelClassFromPath(urlWithIdAndSlash, true), 'fancy-user', 'it returns a singular model name');

    urlWithSlash = '/api/exquisite-users';
    urlWithIdAndSlash = '/api/exquisite-users/:objectId';

    assert.equal(this.handler.getModelClassFromPath(urlWithSlash), 'exquisite-user', 'it returns a singular model name');
    assert.equal(this.handler.getModelClassFromPath(urlWithIdAndSlash, true), 'exquisite-user', 'it returns a singular model name');

    urlWithSlash = '/api/elegant-users';
    urlWithIdAndSlash = '/api/elegant-users/:firstName/:lastName';

    assert.equal(this.handler.getModelClassFromPath(urlWithSlash), 'elegant-user', 'it returns a singular model name');
    assert.equal(this.handler.getModelClassFromPath(urlWithIdAndSlash, true), 'elegant-user', 'it returns a singular model name');
  });

  test('it can read the id from the url', function(assert) {
    let request = { params: { id: 'test-id' } };
    assert.equal(this.handler._getIdForRequest(request), 'test-id', 'it returns id from url parameters.');
  });

  test('it can read the id from the request body', function(assert) {
    let request = { params: {} };
    let jsonApiDoc = { data: { id: 'jsonapi-id' } };
    assert.equal(this.handler._getIdForRequest(request, jsonApiDoc), 'jsonapi-id', 'it returns id from json api data.');
  });

});
