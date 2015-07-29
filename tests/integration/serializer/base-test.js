import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - Base', {
  beforeEach() {
    this.serializer = new Serializer();
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test('it returns pojos unaffected', function(assert) {
  var result = this.serializer.serialize({oh: 'hai'});

  assert.deepEqual(result, {oh: 'hai'});
});

test('it returns arrays unaffected', function(assert) {
  var data = [{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}];
  var result = this.serializer.serialize(data);

  assert.deepEqual(result, data);
});

test(`it serializes a model by returning its attrs`, function(assert) {
  var user = schemaHelper.getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.deepEqual(result, {
    id: 1,
    name: 'Link',
    age: 323
  });
});

test(`it serializes a collection of models by returning an array of their attrs`, function(assert) {
  var collection = schemaHelper.getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);
});

test(`it serializes a collection of models by returning an array of their attrs`, function(assert) {
  var collection = schemaHelper.getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);
});
