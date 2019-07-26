import { _ormSchema as Schema, _Db as Db, Model } from '@miragejs/server';
import {module, test} from 'qunit';

let db;

module('Integration | ORM | destroy', function(hooks) {
  hooks.beforeEach(function() {
    db = new Db({
      users: [
        { id: 1, name: 'Link', evil: false },
        { id: 2, name: 'Link', location: 'Hyrule', evil: false },
        { id: 3, name: 'Zelda', location: 'Hyrule', evil: false }
      ]
    });

    this.schema = new Schema(db, {
      user: Model
    });
  });

  test('destroying a model removes the associated record from the db', function(assert) {
    assert.deepEqual(db.users.length, 3);

    let link = this.schema.users.find(1);
    link.destroy();

    assert.deepEqual(db.users.find(1), null);
    assert.deepEqual(db.users.length, 2);
  });

  test('destroying a collection removes the associated records from the db', function(assert) {
    assert.deepEqual(db.users.length, 3);

    let users = this.schema.users.all();
    users.destroy();

    assert.deepEqual(db.users, []);
  });
});
