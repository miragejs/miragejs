import { _ormSchema as Schema, _Db as Db, Collection, Model } from '@miragejs/server';
import {module, test} from 'qunit';

module('Integration | ORM | collection', function(hooks) {
  hooks.beforeEach(function() {
    this.User = Model.extend();
    this.db = new Db({ users: [
      { id: 1, name: 'Link', good: true },
      { id: 2, name: 'Zelda', good: true },
      { id: 3, name: 'Ganon', good: false }
    ] });

    this.schema = new Schema(this.db, {
      user: this.User
    });
  });

  test('a collection can save its models', function(assert) {
    let collection = this.schema.users.all();
    collection.models[0].name = 'Sam';
    collection.save();

    assert.deepEqual(this.db.users[0], { id: '1', name: 'Sam', good: true });
  });

  test('a collection can reload its models', function(assert) {
    let collection = this.schema.users.all();
    assert.equal(collection.models[0].name, 'Link');

    collection.models[0].name = 'Sam';
    assert.equal(collection.models[0].name, 'Sam');

    collection.reload();
    assert.equal(collection.models[0].name, 'Link');
  });

  test('a collection can filter its models', function(assert) {
    let collection = this.schema.users.all();
    assert.equal(collection.models.length, 3);

    let newCollection = collection.filter((author) => author.good);

    assert.ok(newCollection instanceof Collection);
    assert.equal(newCollection.modelName, 'user', 'the filtered collection has the right type');
    assert.equal(newCollection.models.length, 2);
  });

  test('a collection can sort its models', function(assert) {
    let collection = this.schema.users.all();
    assert.deepEqual(collection.models.map((m) => m.name), ['Link', 'Zelda', 'Ganon']);

    let newCollection = collection.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    assert.ok(newCollection instanceof Collection);
    assert.equal(newCollection.modelName, 'user', 'the sorted collection has the right type');
    assert.deepEqual(newCollection.models.map((m) => m.name), ['Ganon', 'Link', 'Zelda']);
  });

  test('a collection can slice its models', function(assert) {
    let collection = this.schema.users.all();
    assert.deepEqual(collection.models.map(m => m.name), ['Link', 'Zelda', 'Ganon'], 'Starts with 3');

    let newCollection = collection.slice(-2);

    assert.ok(newCollection instanceof Collection);
    assert.equal(newCollection.modelName, 'user', 'the sliced collection has the right type');
    assert.deepEqual(newCollection.models.map(m => m.name), ['Zelda', 'Ganon']);
  });

  test('a collection can merge with another collection', function(assert) {
    let goodGuys = this.schema.users.where((user) => user.good);
    let badGuys = this.schema.users.where((user) => !user.good);

    assert.equal(goodGuys.models.length, 2);
    assert.equal(badGuys.models.length, 1);

    goodGuys.mergeCollection(badGuys);

    assert.equal(goodGuys.models.length, 3);
  });
});
