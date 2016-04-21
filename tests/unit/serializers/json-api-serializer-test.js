import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../integration/serializers/schema-helper';
import _map from 'lodash/collection/map';
import _includes from 'lodash/collection/includes';

import {module, test} from 'qunit';

module('Unit | Serializers | JsonApiSerializer');

test('_getRelationshipNames should prefer relationships from request', function(assert) {
  let serializer = new (JsonApiSerializer.extend({
    include: ['foo', 'bar']
  }))();

  let request = {
    queryParams: {
      include: 'baz,quux'
    }
  };
  let result = serializer._getRelationshipNames(request);

  assert.deepEqual(result, ['baz', 'quux']);
});

test('_getRelationshipNames should not choke on missing request', function(assert) {
  let serializer = new (JsonApiSerializer.extend({
    include: ['foo', 'bar']
  }))();
  let result = serializer._getRelationshipNames();

  assert.deepEqual(result, ['foo', 'bar']);
});

test('_getRelationshipNames should not choke on empty request', function(assert) {
  let serializer = new (JsonApiSerializer.extend({
    include: ['foo', 'bar']
  }))();
  let request = {};

  let result = serializer._getRelationshipNames(request);

  assert.deepEqual(result, ['foo', 'bar']);
});

test('_getRelationshipNames should not choke on empty queryParams', function(assert) {
  let serializer = new (JsonApiSerializer.extend({
    include: ['foo', 'bar']
  }))();
  let request = { queryParams: {} };

  let result = serializer._getRelationshipNames(request);

  assert.deepEqual(result, ['foo', 'bar']);
});

test('_getRelationshipNames should not choke on empty included', function(assert) {
  let serializer = new (JsonApiSerializer.extend({
    include: ['foo', 'bar']
  }))();
  let request = {
    queryParams: {
      include: ''
    }
  };

  let result = serializer._getRelationshipNames(request);

  assert.deepEqual(result, []);
});

test('_getRelationshipNames should not choke on missing serializer.relationships', function(assert) {
  let serializer = new (JsonApiSerializer.extend())();
  let request = {
    queryParams: {
      include: 'baz,quux'
    }
  };

  let result = serializer._getRelationshipNames(request);

  assert.deepEqual(result, ['baz', 'quux']);
});

test('_getRelatedModelWithPath belongsTo', function(assert) {
  let serializer = new (JsonApiSerializer.extend())();
  let schema = schemaHelper.setup();

  let foo = schema.foos.create();
  let bar = foo.createBar();
  foo.save();
  let baz = bar.createBaz();
  bar.save();
  let quux1 = baz.createQuux();
  let quux2 = baz.createQuux();
  baz.save();
  let zomg1 = quux1.createZomg();
  let zomg2 = quux1.createZomg();
  quux1.save();
  let zomg3 = quux2.createZomg();
  let zomg4 = quux2.createZomg();
  quux2.save();
  let lol1 = zomg1.createLol();
  let lol2 = zomg2.createLol();
  let lol3 = zomg3.createLol();
  let lol4 = zomg4.createLol();
  zomg1.save();
  zomg2.save();
  zomg3.save();
  zomg4.save();

  let result = serializer._getRelatedWithPath(foo, 'bar.baz.quuxes.zomgs.lol');
  let ids = _map(result, 'id');

  assert.equal(result.length, 4);
  assert.ok(_includes(ids, lol1.id));
  assert.ok(_includes(ids, lol2.id));
  assert.ok(_includes(ids, lol3.id));
  assert.ok(_includes(ids, lol4.id));
});
