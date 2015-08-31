import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

var db, collection;
module('Integration | Schema | Updating a Collection', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('users');
    var schema = new Schema(db);

    var User = Model.extend();
    schema.registerModel('user', User);

    collection = new Collection('user', [
      schema.user.create({name: 'Link', location: 'Hyrule', evil: false}),
      schema.user.create({name: 'Zelda', location: 'Hyrule', evil: false}),
    ]);
  }
});

test('it can update its models with a key and value', function(assert) {
  assert.deepEqual(db.users, [
    {id: 1, name: 'Link', location: 'Hyrule', evil: false},
    {id: 2, name: 'Zelda', location: 'Hyrule', evil: false},
  ]);

  collection.update('evil', true);

  assert.deepEqual(db.users, [
    {id: 1, name: 'Link', location: 'Hyrule', evil: true},
    {id: 2, name: 'Zelda', location: 'Hyrule', evil: true},
  ]);
  assert.deepEqual(collection[0].attrs, {id: 1, name: 'Link', location: 'Hyrule', evil: true});
  assert.deepEqual(collection[1].attrs, {id: 2, name: 'Zelda', location: 'Hyrule', evil: true});
});

test('it can update its models with a hash of attrs', function(assert) {
  assert.deepEqual(db.users, [
    {id: 1, name: 'Link', location: 'Hyrule', evil: false},
    {id: 2, name: 'Zelda', location: 'Hyrule', evil: false},
  ]);

  collection.update({location: 'The water temple', evil: true});

  assert.deepEqual(db.users, [
    {id: 1, name: 'Link', location: 'The water temple', evil: true},
    {id: 2, name: 'Zelda', location: 'The water temple', evil: true},
  ]);
  assert.deepEqual(collection[0].attrs, {id: 1, name: 'Link', location: 'The water temple', evil: true});
  assert.deepEqual(collection[1].attrs, {id: 2, name: 'Zelda', location: 'The water temple', evil: true});
});


var db, schema, User;
module('Integration | Schema | Updating a Model', {
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

test('it can set an attribute and then save the model', function(assert) {
  var user = schema.user.find(1);

  user.name = 'Young link';

  assert.deepEqual(user.attrs, {id: 1, name: 'Young link', evil: false});
  assert.deepEqual(db.users, [{id: 1, name: 'Link', evil: false}]);

  user.save();

  assert.deepEqual(user.attrs, {id: 1, name: 'Young link', evil: false});
  assert.deepEqual(db.users, [{id: 1, name: 'Young link', evil: false}]);
});

test('it can update a single attr immediately', function(assert) {
  var link = schema.user.find(1);
  link.update('evil', true);

  assert.deepEqual(link.attrs, {id: 1, name: 'Link', evil: true});
  assert.deepEqual(db.users.find(1), {id: 1, name: 'Link', evil: true});
});

test('it can update a hash of attrs immediately', function(assert) {
  var link = schema.user.find(1);
  link.update({name: 'Evil link', evil: true});

  assert.deepEqual(link.attrs, {id: 1, name: 'Evil link', evil: true});
  assert.deepEqual(db.users.find(1), {id: 1, name: 'Evil link', evil: true});
});
