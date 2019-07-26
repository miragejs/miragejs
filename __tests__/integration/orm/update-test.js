import { Model, _ormSchema as Schema, _Db as Db } from '@miragejs/server';
import {module, test} from 'qunit';

module('Integration | ORM | update', function(hooks) {
  hooks.beforeEach(function() {
    this.db = new Db({
      users: [
        { id: 1, name: 'Link', location: 'Hyrule', evil: false },
        { id: 2, name: 'Zelda', location: 'Hyrule', evil: false }
      ]
    });

    this.schema = new Schema(this.db, {
      user: Model
    });
  });

  test('a collection can update its models with a key and value', function(assert) {
    let collection = this.schema.users.all();
    collection.update('evil', true);

    assert.deepEqual(this.db.users, [
      { id: '1', name: 'Link', location: 'Hyrule', evil: true },
      { id: '2', name: 'Zelda', location: 'Hyrule', evil: true }
    ]);
    assert.deepEqual(collection.models[0].attrs, { id: '1', name: 'Link', location: 'Hyrule', evil: true });
  });

  test('it can update its models with a hash of attrs', function(assert) {
    let collection = this.schema.users.all();
    collection.update({ location: 'The water temple', evil: true });

    assert.deepEqual(this.db.users, [
      { id: '1', name: 'Link', location: 'The water temple', evil: true },
      { id: '2', name: 'Zelda', location: 'The water temple', evil: true }
    ]);
    assert.deepEqual(collection.models[0].attrs, { id: '1', name: 'Link', location: 'The water temple', evil: true });
    assert.deepEqual(collection.models[1].attrs, { id: '2', name: 'Zelda', location: 'The water temple', evil: true });
  });

  test('it can set an attribute and then save the model', function(assert) {
    let user = this.schema.users.find(1);

    user.name = 'Young link';

    assert.deepEqual(user.attrs, { id: '1', name: 'Young link', location: 'Hyrule', evil: false });
    assert.deepEqual(this.db.users.find(1), { id: '1', name: 'Link', location: 'Hyrule', evil: false });

    user.save();

    assert.deepEqual(user.attrs, { id: '1', name: 'Young link', location: 'Hyrule', evil: false });
    assert.deepEqual(this.db.users.find(1), { id: '1', name: 'Young link', location: 'Hyrule', evil: false });
  });

  test('it can update and immediately persist a single attribute', function(assert) {
    let link = this.schema.users.find(1);
    link.update('evil', true);

    assert.deepEqual(link.attrs, { id: '1', name: 'Link', location: 'Hyrule', evil: true });
    assert.deepEqual(this.db.users.find(1), { id: '1', name: 'Link', location: 'Hyrule', evil: true });
  });

  test('it can update a hash of attrs immediately', function(assert) {
    var link = this.schema.users.find(1);
    link.update({ name: 'Evil link', evil: true });

    assert.deepEqual(link.attrs, { id: '1', name: 'Evil link', location: 'Hyrule', evil: true });
    assert.deepEqual(this.db.users.find(1), { id: '1', name: 'Evil link', location: 'Hyrule', evil: true });
  });

  test('it can update a non-existing attribute', function(assert) {
    var link = this.schema.users.find(1);
    link.update({ name: 'Evil link', evil: true, reallyEvil: 'absolutely evil' });

    assert.deepEqual(link.attrs, { id: '1', name: 'Evil link', location: 'Hyrule', evil: true, reallyEvil: 'absolutely evil' });
    assert.deepEqual(this.db.users.find(1), { id: '1', name: 'Evil link', location: 'Hyrule', evil: true, reallyEvil: 'absolutely evil' });
  });

  test('if users sets incorrectly an attribute without using update, it will still work', function(assert) {
    var link = this.schema.users.find(1);
    link.reallyEvil = 'absolutely evil';
    link.update({ reallyEvil: 'a little flower', evil: true });
    assert.deepEqual(link.attrs, { id: '1', reallyEvil: 'a little flower', evil: true, location: 'Hyrule', name: 'Link' });
    assert.deepEqual(this.db.users.find(1), { id: '1', reallyEvil: 'a little flower', evil: true, location: 'Hyrule', name: 'Link' });
  });
});
