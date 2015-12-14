import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';

import {module, test} from 'qunit';

module('Unit | Serializers | JsonApiSerializer', {
  beforeEach() {
    this.serializer = new JsonApiSerializer();
  }
});

test('_combineRelationships should combine relationships from serializer and request', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {
    queryParams: {
      include: 'baz,quux'
    }
  };

  const result = this.serializer._combineRelationships(otherSerializer, request);

  assert.deepEqual(result, ['foo', 'bar', 'baz', 'quux']);
});


test('_combineRelationships should not choke on missing request', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const result = this.serializer._combineRelationships(otherSerializer);

  assert.deepEqual(result, ['foo', 'bar']);
});


test('_combineRelationships should not choke on empty request', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {};

  const result = this.serializer._combineRelationships(otherSerializer, request);

  assert.deepEqual(result, ['foo', 'bar']);
});


test('_combineRelationships should not choke on empty queryParams', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {queryParams: {}};

  const result = this.serializer._combineRelationships(otherSerializer, request);

  assert.deepEqual(result, ['foo', 'bar']);
});


test('_combineRelationships should not choke on empty included', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {
    queryParams: {
      included: ''
    }
  };

  const result = this.serializer._combineRelationships(otherSerializer, request);

  assert.deepEqual(result, ['foo', 'bar']);
});


test('_combineRelationships should not choke on missing serializer.relationships', function(assert) {

  const request = {
    queryParams: {
      include: 'baz,quux'
    }
  };

  const result = this.serializer._combineRelationships(undefined, request);

  assert.deepEqual(result, ['baz', 'quux']);
});
