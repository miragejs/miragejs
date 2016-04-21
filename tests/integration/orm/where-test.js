// jscs:disable disallowVar
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

let schema;
let User = Model.extend();
module('Integration | ORM | #where', {
  beforeEach() {
    let db = new Db({ users: [
      { id: 1, name: 'Link', good: true },
      { id: 2, name: 'Zelda', good: true },
      { id: 3, name: 'Ganon', good: false }
    ] });

    schema = new Schema(db, {
      user: User
    });
  }
});

test('it returns models that match a query with where', function(assert) {
  let users = schema.users.where({ good: false });

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.equal(users.models.length, 1);
  assert.ok(users.models[0] instanceof User);
  assert.deepEqual(users.models[0].attrs, { id: '3', name: 'Ganon', good: false });
});

test('it returns models that match using a query function', function(assert) {
  let users = schema.users.where(function(rec) {
    return !rec.good;
  });

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.equal(users.models.length, 1);
  assert.ok(users.models[0] instanceof User);
  assert.deepEqual(users.models[0].attrs, { id: '3', name: 'Ganon', good: false });
});

test('it returns an empty collection if no models match a query', function(assert) {
  let users = schema.users.where({ name: 'Link', good: false });

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.equal(users.models.length, 0);
});
