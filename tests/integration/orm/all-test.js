// jscs:disable disallowVar
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

module('Integration | ORM | #all');

test('it can return all models', function(assert) {
  let db = new Db({
    users: [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' }
    ]
  });
  let User = Model.extend();
  let schema = new Schema(db, {
    user: User
  });

  let users = schema.users.all();
  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.ok(users.models[0] instanceof User, 'each member of the collection is a model');
  assert.equal(users.models.length, 2);
  assert.deepEqual(users.models[1].attrs, { id: '2', name: 'Zelda' });
});

test('it returns an empty array when no models exist', function(assert) {
  let db = new Db({ users: [] });

  let User = Model.extend();
  let schema = new Schema(db, {
    user: User
  });

  let users = schema.users.all();

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.equal(users.modelName, 'user', 'the collection knows its type');
  assert.equal(users.models.length, 0);
});
