import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

module('Unit | Collection');

test('it can be instantiated', function(assert) {
  let collection = new Collection('plant');

  assert.ok(collection);
});

test('it cannot be instantiated without a modelName', function(assert) {
  assert.throws(() => {
    new Collection();
  }, /must pass a `modelName`/);
});

test('it knows its modelname', function(assert) {
  let collection = new Collection('author');

  assert.equal(collection.modelName, 'author');
});

test('it can be instantiated with an array of models', function(assert) {
  let models = [{ id: 1 }, { id: 2 }, { id: 3 }];
  let collection = new Collection('author', models);

  assert.ok(collection);
});

test('#models returns the underlying array', function(assert) {
  let models = [{ id: 1 }, { id: 2 }, { id: 3 }];
  let collection = new Collection('author', models);

  assert.deepEqual(collection.models, models);
});

// test('collection.filter returns collection instance', function(assert) {
//   let collection = new Collection('plant');
//   let filteredCollection = collection.filter(Boolean);
//   assert.ok(filteredCollection instanceof Collection);
//   assert.equal(filteredCollection.modelName, 'plant');
// });
//
// test('collection.mergeCollection works', function(assert) {
//   let collection1 = new Collection('plant', { name: 'chrerry' }, { name: 'uchreaflier' });
//   let collection2 = new Collection('plant', { name: 'vlip' });
//   assert.equal(collection1.length, 2);
//   assert.equal(collection2.length, 1);
//   collection2.mergeCollection(collection1);
//   assert.equal(collection2.length, 3);
//   assert.equal(collection2.modelName, 'plant');
// });
//
