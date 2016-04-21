// jscs:disable disallowVar
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

var db, schema, User;
module('Integration | ORM | create', {
  beforeEach() {
    User = Model.extend();
    db = new Db();
    schema = new Schema(db, {
      user: User
    });
  }
});

test('it cannot make new models that havent been registered', function(assert) {
  assert.throws(function() {
    schema.authors.new({ name: 'Link' });
  });
});

test('it cannot create models that havent been registered', function(assert) {
  assert.throws(function() {
    schema.authors.create({ name: 'Link' });
  });
});

test('it can make new models and then save them', function(assert) {
  let user = schema.users.new({ name: 'Link' });

  assert.ok(user instanceof User);
  assert.deepEqual(user.attrs, { name: 'Link' });
  assert.deepEqual(db.users, []);

  user.save();

  assert.ok(user.id, 'user has an id getter');
  assert.deepEqual(user.attrs, { id: '1', name: 'Link' });
  assert.deepEqual(db.users, [{ id: '1', name: 'Link' }]);
});

test('it can create new models, saved directly to the db', function(assert) {
  let user = schema.users.create({ name: 'Link' });

  assert.ok(user instanceof Model);
  assert.ok(user instanceof User);
  assert.deepEqual(user.attrs, { id: '1', name: 'Link' });
  assert.deepEqual(db.users, [{ id: '1', name: 'Link' }]);
});
