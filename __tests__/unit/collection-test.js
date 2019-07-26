import { Collection } from '../../lib';

describe('Unit | Collection', function() {
  test('it can be instantiated', () => {
    let collection = new Collection('plant');

    expect(collection).toBeTruthy();
  });

  test('it cannot be instantiated without a modelName', () => {
    expect(() => {
      new Collection();
    }).toThrow(/must pass a `modelName`/);
  });

  test('it knows its modelname', () => {
    let collection = new Collection('author');

    expect(collection.modelName).toEqual('author');
  });

  test('it can be instantiated with an array of models', () => {
    let models = [{ id: 1 }, { id: 2 }, { id: 3 }];
    let collection = new Collection('author', models);

    expect(collection).toBeTruthy();
  });

  test('#models returns the underlying array', () => {
    let models = [{ id: 1 }, { id: 2 }, { id: 3 }];
    let collection = new Collection('author', models);

    expect(collection.models).toEqual(models);
  });

  test('#length returns the number of elements', () => {
    let models = [{ id: 1 }, { id: 2 }];
    let collection = new Collection('post', models);

    expect(collection).toHaveLength(2);

    collection.models = [{ id: 1 }];
    expect(collection).toHaveLength(1);
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
});
