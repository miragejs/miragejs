import { Collection, _ormSchema as Schema, _Db as Db, Model } from '@miragejs/server';
import {module, test} from 'qunit';

let schema;
let User = Model.extend();

module('Integration | ORM | #none', function(hooks) {
  hooks.beforeEach(function() {
    let db = new Db({ users: [
      { id: 1, name: 'Link', good: true },
      { id: 2, name: 'Zelda', good: true },
      { id: 3, name: 'Ganon', good: false }
    ] });

    schema = new Schema(db, {
      user: User
    });
  });

  test('it returns an empty collection', function(assert) {
    let users = schema.users.none();

    assert.ok(users instanceof Collection, 'it returns a collection');
    assert.equal(users.models.length, 0);
  });
});
