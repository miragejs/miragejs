import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

module('Unit | Collection');

test('it can be instantiated', function(assert) {
  var collection = new Collection('plant');
  assert.ok(collection);
});

test('collection.filter returns collection instance', function(assert) {
  var collection = new Collection('plant');
  var filteredCollection = collection.filter(Boolean);
  assert.ok(filteredCollection instanceof Collection);
  assert.equal(filteredCollection.modelName, 'plant');
});

test('collection.mergeCollection works', function(assert) {
  var collection1 = new Collection('plant', { name: 'chrerry'}, { name: 'uchreaflier' });
  var collection2 = new Collection('plant', { name: 'vlip'});
  assert.equal(collection1.length, 2);
  assert.equal(collection2.length, 1);
  collection2.mergeCollection(collection1);
  assert.equal(collection2.length, 3);
  assert.equal(collection2.modelName, 'plant');
});

test('it cannot be instantiated without a modelName', function(assert) {
  assert.throws(() => {
    new Collection();
  }, /must pass a `modelName`/);
});
