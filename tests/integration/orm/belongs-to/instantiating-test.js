// jscs:disable disallowVar
import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

var schema, link;
module('Integration | ORM | belongsTo instantiating with params', {
  beforeEach() {
    let db = new Db({
      users: [
        { id: 1, name: 'Link' }
      ],
      addresses: []
    });

    let User = Model.extend();
    let Address = Model.extend({
      user: Mirage.belongsTo()
    });

    schema = new Schema(db);
    schema.registerModels({
      user: User,
      address: Address
    });

    link = schema.users.find(1);
  }
});

test('the child accepts a saved parents id', function(assert) {
  let address = schema.addresses.new({ userId: 1 });

  assert.equal(address.userId, 1);
  assert.deepEqual(address.user, link);
  assert.deepEqual(address.attrs, { userId: 1 });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    schema.addresses.new({ userId: 2 });
  }, /Couldn't find user/);
});

test('the child accepts a null parent id', function(assert) {
  let address = schema.addresses.new({ userId: null });

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, { userId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let address = schema.addresses.new({ user: link });

  assert.equal(address.userId, 1);
  assert.deepEqual(address.user, link);
  assert.deepEqual(address.attrs, { userId: '1' });
});

test('the child accepts a new parent model', function(assert) {
  let zelda = schema.users.new({ name: 'Zelda' });
  let address = schema.addresses.new({ user: zelda });

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, zelda);
  assert.deepEqual(address.attrs, { userId: null });
});

test('the child accepts a null parent model', function(assert) {
  let address = schema.addresses.new({ user: null });

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, { userId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let address = schema.addresses.new({ user: link, userId: 1 });

  assert.equal(address.userId, '1');
  assert.deepEqual(address.user, link);
  assert.deepEqual(address.attrs, { userId: 1 });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let address = schema.addresses.new({});

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, { userId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let address = schema.addresses.new();

  assert.equal(address.userId, null);
  assert.deepEqual(address.user, null);
  assert.deepEqual(address.attrs, { userId: null });
});
