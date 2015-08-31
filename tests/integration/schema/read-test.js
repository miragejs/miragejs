import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';


module('Integration | Schema | read#all');

test('it can return all models', function(assert) {
  var db = new Db();
  db.createCollection('users');
  db.users.insert([{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}]);
  var schema = new Schema(db);

  var User = Model.extend();
  schema.registerModel('user', User);

  var users = schema.user.all();

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.ok(users[0] instanceof User, 'each member of the collection is a model');
  assert.equal(users.length, 2);
  assert.deepEqual(users[1].attrs, {id: 2, name: 'Zelda'});
});

test('it returns an empty array when no models exist', function(assert) {
  var db = new Db();
  db.createCollection('users');
  var schema = new Schema(db);

  var User = Model.extend();
  schema.registerModel('user', User);

  var users = schema.user.all();

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.equal(users.type, 'user', 'the collection knows its type');
  assert.equal(users.length, 0);
});


var schema;
var User = Model.extend();
module('Integration | Schema | read#find', {
  beforeEach: function() {
    var db = new Db();
    db.createCollection('users');
    db.users.insert([{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}]);
    schema = new Schema(db);

    schema.registerModel('user', User);
  }
});

test('it can find a model by id', function(assert) {
  var zelda = schema.user.find(2);

  assert.ok(zelda instanceof User);
  assert.deepEqual(zelda.attrs, {id: 2, name: 'Zelda'});
});

test('it returns null if no model is found for an id', function(assert) {
  var user = schema.user.find(4);

  assert.equal(user, null);
});

test('it can find multiple models by ids', function(assert) {
  var users = schema.user.find([1, 2]);

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.ok(users[0] instanceof User);
  assert.equal(users.length, 2);
  assert.deepEqual(users[1].attrs, {id: 2, name: 'Zelda'});
});

test('it errors if incorrect number of models are found for an array of ids', function(assert) {
  assert.throws(function() {
    schema.user.find([1, 6]);
  }, /Couldn't find all users/);
});


var schema;
var User = Model.extend();
module('Integration | Schema | read#where', {
  beforeEach: function() {
    var db = new Db();
    db.createCollection('users');
    db.users.insert([
      {id: 1, name: 'Link', good: true},
      {id: 2, name: 'Zelda', good: true},
      {id: 3, name: 'Ganon', good: false}
    ]);
    schema = new Schema(db);

    schema.registerModel('user', User);
  }
});

test('it returns models that match a query with where', function(assert) {
  var users = schema.user.where({good: false});

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.equal(users.length, 1);
  assert.ok(users[0] instanceof User);
  assert.deepEqual(users[0].attrs, {id: 3, name: 'Ganon', good: false});
});

test('it returns an empty collection if no models match a query', function(assert) {
  var users = schema.user.where({name: 'Link', good: false});

  assert.ok(users instanceof Collection, 'it returns a collection');
  assert.equal(users.length, 0);
});


var db, schema, User;
module('Integration | Schema | Reading a models attrs', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('users');
    db.users.insert([
      {id: 1, name: 'Link', evil: false}
    ]);
    schema = new Schema(db);
    User = Model.extend();
    schema.registerModel('user', User);
  }
});

test('attrs returns the models attributes', function(assert) {
  var user = schema.user.find(1);

  assert.deepEqual(user.attrs, {id: 1, name: 'Link', evil: false});
});

test('attributes can be read via plain property access', function(assert) {
  var user = schema.user.find(1);

  assert.equal(user.name, 'Link');
});
