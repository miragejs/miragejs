import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

module('Unit | Collection');

test('it can be instantiated', function(assert) {
  var collection = new Collection('type');
  assert.ok(collection);
});

test('collection.filter returns collection instance', function(assert) {
  var collection = new Collection('type');
  var filteredCollection = collection.filter(Boolean);
  assert.ok(filteredCollection instanceof Collection);
});

test('it cannot be instantiated without a modelName', function(assert) {
  assert.throws(() => {
    new Collection();
  }, /must pass a `modelName`/);
});
