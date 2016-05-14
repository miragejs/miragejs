import BaseShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/base';

import {module, test} from 'qunit';

module('Unit | Route handlers | Shorthands | BaseShorthandRouteHandler', {
  beforeEach() {
    this.handler = new BaseShorthandRouteHandler();
    this.request = { params: { id: '' } };
  }
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

test('getModelClassFromPath works', function(assert) {
  let urlWithSlash = '/api/fancy-users';
  let urlWithIdAndSlash = '/api/fancy-users/:id';

  assert.equal(this.handler.getModelClassFromPath(urlWithSlash), 'fancy-user', 'it returns a singular model name');
  assert.equal(this.handler.getModelClassFromPath(urlWithIdAndSlash, true), 'fancy-user', 'it returns a singular model name');
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

test('_getAttrsForRequest works with attributes and relationships', function(assert) {
  let payload = {
    'data': {
      'attributes': {
        'does-mirage': true,
        'name': 'Sam'
      },
      'relationships': {
        'company': {
          'data': {
            'id': '1',
            'type': 'companies'
          }
        },
        'github-account': {
          'data': {
            'id': '1',
            'type': 'github-accounts'
          }
        },
        'something': {
          'data': null
        },
        'many-things': {
          'data': []
        }
      },
      'type': 'github-account'
    }
  };

  this.handler._getJsonApiDocForRequest = function(request, modelName) {
    return payload;
  };

  let attrs = this.handler._getAttrsForRequest(this.request, 'user');

  assert.deepEqual(
    attrs,
    {
      name: 'Sam',
      doesMirage: true,
      companyId: '1',
      githubAccountId: '1',
      somethingId: null
    },
    'it normalizes data correctly.'
  );
});

test('_getAttrsForRequest works with just relationships', function(assert) {
  let payload = {
    'data': {
      'relationships': {
        'company': {
          'data': {
            'id': '1',
            'type': 'companies'
          }
        }
      },
      'type': 'github-account'
    }
  };

  this.handler._getJsonApiDocForRequest = function(request, modelName) {
    return payload;
  };

  let attrs = this.handler._getAttrsForRequest(this.request, 'user');

  assert.deepEqual(
    attrs,
    {
      companyId: '1'
    },
    'it normalizes data correctly.'
  );
});
