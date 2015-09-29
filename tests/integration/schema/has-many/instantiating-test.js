import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

var schema, child1, child2;
module('Integration | Schema | hasMany instantiating with params', {
  beforeEach: function() {
    var db = new Db({
      users: [],
      addresses: [
        {id: 1, name: '123 Hyrule Way'},
        {id: 2, name: '12 Goron City'},
      ]
    });
    schema = new Schema(db);

    var User = Model.extend({
      addresses: Mirage.hasMany()
    });
    var Address = Model.extend();

    schema.registerModels({
      user: User,
      address: Address
    });

    child1 = schema.address.find(1);
    child2 = schema.address.find(2);
  }
});

test('children have fks added to their attrs', function(assert) {
  var newChild = schema.address.new();
  assert.deepEqual(newChild.attrs, {userId: null});
  assert.deepEqual(child1.attrs, {id: 1, name: '123 Hyrule Way', userId: null});
});

test('the parent accepts an array of saved children ids', function(assert) {
  var user = schema.user.new({addressIds: [1, 2]});

  assert.equal(user.addresses.length, 2);
  assert.deepEqual(user.addresses[0], child1);
  assert.deepEqual(user.addresses[1], child2);
  assert.deepEqual(user.addressIds, [1, 2]);
});

test('the parent errors if one of the child ids doesnt exist', function(assert) {
  assert.throws(function() {
    schema.user.new({addressIds: [1, 9]});
  }, /Couldn't find/);
});

test('the parent accepts an empty childIds array', function(assert) {
  var user = schema.user.new({addressIds: []});

  assert.equal(user.addresses.length, 0);
});

test('the parent accepts an array of saved child models', function(assert) {
  var user = schema.user.new({addresses: [child1, child2]});

  assert.deepEqual(user.addressIds, [1, 2]);
  assert.equal(user.addresses.length, 2);
  assert.deepEqual(user.addresses[0], child1);
});

test('the parent accepts an array of new child models', function(assert) {
  var newAddress1 = schema.address.new();
  var newAddress2 = schema.address.new();
  var user = schema.user.new({addresses: [newAddress1, newAddress2]});

  assert.deepEqual(user.addressIds, [undefined, undefined]);
  assert.equal(user.addresses.length, 2);
  assert.deepEqual(user.addresses[0], newAddress1);
});

test('the parent accepts a mixed array of new and saved child models', function(assert) {
  var newAddress1 = schema.address.new();
  var user = schema.user.new({addresses: [child1, newAddress1]});

  assert.deepEqual(user.addressIds, [1, undefined]);
  assert.equal(user.addresses.length, 2);
  assert.deepEqual(user.addresses[0], child1);
  assert.deepEqual(user.addresses[1], newAddress1);
});

test('the parent accepts null child models', function(assert) {
  var user = schema.user.new({addresses: [null]});

  assert.deepEqual(user.addressIds, []);
  assert.equal(user.addresses.length, 0);
});

test('the parent accepts no reference to a child id or model as empty obj', function(assert) {
  var user = schema.user.new({});

  assert.deepEqual(user.addressIds, []);
  assert.equal(user.addresses.length, 0);
});

test('the parent accepts no reference to a child id or model', function(assert) {
  var user = schema.user.new();

  assert.deepEqual(user.addressIds, []);
  assert.equal(user.addresses.length, 0);
});
