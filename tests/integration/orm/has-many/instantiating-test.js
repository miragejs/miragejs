// jscs:disable disallowVar
import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

var schema, child1, child2;
module('Integration | ORM | hasMany instantiating with params', {
  beforeEach() {
    let db = new Db({
      users: [],
      homeAddresses: [
        { id: 1, name: '123 Hyrule Way' },
        { id: 2, name: '12 Goron City' }
      ]
    });
    schema = new Schema(db);

    let User = Model.extend({
      homeAddresses: Mirage.hasMany()
    });
    let HomeAddress = Model.extend();

    schema.registerModels({
      user: User,
      homeAddress: HomeAddress
    });

    child1 = schema.homeAddresses.find(1);
    child2 = schema.homeAddresses.find(2);
  }
});

test('children have fks added to their attrs', function(assert) {
  let newChild = schema.homeAddresses.new();
  assert.deepEqual(newChild.attrs, { userId: null });
  assert.deepEqual(child1.attrs, { id: '1', name: '123 Hyrule Way', userId: null });
});

test('the parent accepts an array of saved children ids', function(assert) {
  let user = schema.users.new({ homeAddressIds: [1, 2] });

  assert.equal(user.homeAddresses.models.length, 2);
  assert.deepEqual(user.homeAddresses.models[0], child1);
  assert.deepEqual(user.homeAddresses.models[1], child2);
  assert.deepEqual(user.homeAddressIds, ['1', '2']);
});

test('the parent errors if one of the child ids doesnt exist', function(assert) {
  assert.throws(function() {
    schema.users.new({ homeAddressIds: [1, 9] });
  }, /Couldn't find/);
});

test('the parent accepts an empty childIds array', function(assert) {
  let user = schema.users.new({ homeAddressIds: [] });

  assert.equal(user.homeAddresses.models.length, 0);
});

test('the parent accepts an array of saved child models', function(assert) {
  let user = schema.users.new({ homeAddresses: [child1, child2] });

  assert.deepEqual(user.homeAddressIds, ['1', '2']);
  assert.equal(user.homeAddresses.models.length, 2);
  assert.deepEqual(user.homeAddresses.models[0], child1);
});

test('the parent accepts an array of new child models', function(assert) {
  let newAddress1 = schema.homeAddresses.new();
  let newAddress2 = schema.homeAddresses.new();
  let user = schema.users.new({ homeAddresses: [newAddress1, newAddress2] });

  assert.deepEqual(user.homeAddressIds, [undefined, undefined]);
  assert.equal(user.homeAddresses.models.length, 2);
  assert.deepEqual(user.homeAddresses.models[0], newAddress1);
});

test('the parent accepts a mixed array of new and saved child models', function(assert) {
  let newAddress1 = schema.homeAddresses.new();
  let user = schema.users.new({ homeAddresses: [child1, newAddress1] });

  assert.deepEqual(user.homeAddressIds, ['1', undefined]);
  assert.equal(user.homeAddresses.models.length, 2);
  assert.deepEqual(user.homeAddresses.models[0], child1);
  assert.deepEqual(user.homeAddresses.models[1], newAddress1);
});

test('the parent accepts null child models', function(assert) {
  let user = schema.users.new({ addresses: [null] });

  assert.deepEqual(user.homeAddressIds, []);
  assert.equal(user.homeAddresses.models.length, 0);
});

test('the parent accepts no reference to a child id or model as empty obj', function(assert) {
  let user = schema.users.new({});

  assert.deepEqual(user.homeAddressIds, []);
  assert.equal(user.homeAddresses.models.length, 0);
});

test('the parent accepts no reference to a child id or model', function(assert) {
  let user = schema.users.new();

  assert.deepEqual(user.homeAddressIds, []);
  assert.equal(user.homeAddresses.models.length, 0);
});
