import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

var schema, link;
module('Integration | Schema | belongsTo instantiating with params', {
  beforeEach: function() {
    var db = new Db({
      users: [
        {id: 1, name: 'Link'}
      ],
      addresses: []
    });

    var User = Model.extend();
    var Address = Model.extend({
      user: Mirage.belongsTo()
    });

    schema = new Schema(db);
    schema.registerModels({
      user: User,
      address: Address
    });

    link = schema.user.find(1);
  }
});

test('the child accepts a saved parents id', function(assert) {
  var address = schema.address.new({userId: 1});

  assert.equal(address.userId, 1);
  assert.deepEqual(address.user, link);
  assert.deepEqual(address.attrs, {userId: 1});
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    schema.address.new({userId: 2});
  }, /Couldn't find user/);
});

test('the child accepts a null parent id', function(assert) {
  var address = schema.address.new({userId: null});

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, {userId: null});
});

test('the child accepts a saved parent model', function(assert) {
  var address = schema.address.new({user: link});

  assert.equal(address.userId, 1);
  assert.deepEqual(address.user, link);
  assert.deepEqual(address.attrs, {userId: 1});
});

test('the child accepts a new parent model', function(assert) {
  var zelda = schema.user.new({name: 'Zelda'});
  var address = schema.address.new({user: zelda});

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, zelda);
  assert.deepEqual(address.attrs, {userId: null});
});

test('the child accepts a null parent model', function(assert) {
  var address = schema.address.new({user: null});

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, {userId: null});
});

test('the child accepts a parent model and id', function(assert) {
  var address = schema.address.new({user: link, userId: 1});

  assert.equal(address.userId, 1);
  assert.deepEqual(address.user, link);
  assert.deepEqual(address.attrs, {userId: 1});
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  var address = schema.address.new({});

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, {userId: null});
});

test('the child accepts no reference to a parent id or model', function(assert) {
  var address = schema.address.new();

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, {userId: null});
});
