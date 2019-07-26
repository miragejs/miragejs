import { Collection, _ormSchema as Schema, _Db as Db, Model } from '@miragejs/server';
import {module, test} from 'qunit';

var schema;
var User = Model.extend();

module('Integration | ORM | #find', function(hooks) {
  hooks.beforeEach(function() {
    let db = new Db({ users: [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' }
    ] });

    schema = new Schema(db, {
      user: User
    });
  });

  test('it can find a model by id', function(assert) {
    let zelda = schema.users.find(2);

    assert.ok(zelda instanceof User);
    assert.deepEqual(zelda.attrs, { id: '2', name: 'Zelda' });
  });

  test('it returns null if no model is found for an id', function(assert) {
    let user = schema.users.find(4);

    assert.equal(user, null);
  });

  test('it can find multiple models by ids', function(assert) {
    let users = schema.users.find([1, 2]);

    assert.ok(users instanceof Collection, 'it returns a collection');
    assert.ok(users.models[0] instanceof User);
    assert.equal(users.models.length, 2);
    assert.deepEqual(users.models[1].attrs, { id: '2', name: 'Zelda' });
  });

  test('it errors if incorrect number of models are found for an array of ids', function(assert) {
    assert.throws(function() {
      schema.users.find([1, 6]);
    }, /Couldn't find all users/);
  });
});
