import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../integration/serializers/schema-helper';
import _map from 'lodash/collection/map';
import _includes from 'lodash/collection/includes';

import {module, test} from 'qunit';

module('Unit | Serializers | JsonApiSerializer', {
  beforeEach() {
    this.serializer = new JsonApiSerializer();
  }
});

test('_getRelationshipNames should prefer relationships from request', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {
    queryParams: {
      include: 'baz,quux'
    }
  };

  const result = this.serializer._getRelationshipNames(otherSerializer, request);

  assert.deepEqual(result, ['baz', 'quux']);
});


test('_getRelationshipNames should not choke on missing request', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const result = this.serializer._getRelationshipNames(otherSerializer);

  assert.deepEqual(result, ['foo', 'bar']);
});


test('_getRelationshipNames should not choke on empty request', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {};

  const result = this.serializer._getRelationshipNames(otherSerializer, request);

  assert.deepEqual(result, ['foo', 'bar']);
});


test('_getRelationshipNames should not choke on empty queryParams', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {queryParams: {}};

  const result = this.serializer._getRelationshipNames(otherSerializer, request);

  assert.deepEqual(result, ['foo', 'bar']);
});


test('_getRelationshipNames should not choke on empty included', function(assert) {

  const otherSerializer = {
    include: ['foo', 'bar']
  };

  const request = {
    queryParams: {
      include: ''
    }
  };

  const result = this.serializer._getRelationshipNames(otherSerializer, request);

  assert.deepEqual(result, []);
});


test('_getRelationshipNames should not choke on missing serializer.relationships', function(assert) {

  const request = {
    queryParams: {
      include: 'baz,quux'
    }
  };

  const result = this.serializer._getRelationshipNames(undefined, request);

  assert.deepEqual(result, ['baz', 'quux']);
});


test('_getRelatedModelWithPath belongsTo', function(assert) {
  const schema = schemaHelper.setup();

  const foo = schema.foo.create();
  const bar = foo.createBar();
  foo.save();
  const baz = bar.createBaz();
  bar.save();
  const quux1 = baz.createQuux();
  const quux2 = baz.createQuux();
  baz.save();
  const zomg1 = quux1.createZomg();
  const zomg2 = quux1.createZomg();
  quux1.save();
  const zomg3 = quux2.createZomg();
  const zomg4 = quux2.createZomg();
  quux2.save();
  const lol1 = zomg1.createLol();
  const lol2 = zomg2.createLol();
  const lol3 = zomg3.createLol();
  const lol4 = zomg4.createLol();
  zomg1.save();
  zomg2.save();
  zomg3.save();
  zomg4.save();

  const result = this.serializer._getRelatedWithPath(foo, 'bar.baz.quuxes.zomgs.lol');
  const ids = _map(result, 'id');

  assert.equal(result.length, 4);
  assert.ok(_includes(ids, lol1.id));
  assert.ok(_includes(ids, lol2.id));
  assert.ok(_includes(ids, lol3.id));
  assert.ok(_includes(ids, lol4.id));
});
