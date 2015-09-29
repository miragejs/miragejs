import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

var schema;
module('Integration | Schema | Creating an Unregistered Model', {
  beforeEach: function() {
    schema = new Schema(new Db());
  }
});

test('it cannot make new models that havent been registered', function(assert) {
  assert.throws(function() {
    schema.user.new({name: 'Link'});
  });
});

test('it cannot create models that havent been registered', function(assert) {
  assert.throws(function() {
    schema.user.create({name: 'Link'});
  });
});


var db, schema, User;
module('Integration | Schema | Creating a Model', {
  beforeEach: function() {
    db = new Db();
    schema = new Schema(db);

    User = Model.extend();
    schema.registerModel('user', User);
  }
});

test('it can make new models and then save them', function(assert) {
  var user = schema.user.new({name: 'Link'});

  assert.ok(user instanceof User);
  assert.deepEqual(user.attrs, {name: 'Link'});
  assert.deepEqual(db.users, []);

  user.save();

  assert.ok(user.id, 'user has an id getter');
  assert.deepEqual(user.attrs, {id: 1, name: 'Link'});
  assert.deepEqual(db.users, [{id: 1, name: 'Link'}]);
});

test('it can create new models, saved directly to the db', function(assert) {
  var user = schema.user.create({name: 'Link'});

  assert.ok(user instanceof Model);
  assert.ok(user instanceof User);
  assert.deepEqual(user.attrs, {id: 1, name: 'Link'});
  assert.deepEqual(db.users, [{id: 1, name: 'Link'}]);
});
