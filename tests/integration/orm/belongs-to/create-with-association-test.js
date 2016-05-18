import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

module('Integration | ORM | belongsTo create with association', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      user: Model.extend(),
      address: Model.extend({
        user: Mirage.belongsTo()
      }),
      foo: Model
    });
  }
});

test('it sets up associations correctly when passing in the foreign key', function(assert) {
  let user = this.schema.create('user');
  let address = this.schema.create('address', {
    userId: user.id
  });

  assert.equal(address.userId, user.id);
  assert.deepEqual(address.user.attrs, user.attrs);
  assert.equal(this.schema.db.users.length, 1);
  assert.deepEqual(this.schema.db.users[0], { id: '1' });
  assert.equal(this.schema.db.addresses.length, 1);
  assert.deepEqual(this.schema.db.addresses[0], { id: '1', userId: '1' });
});

test('it sets up associations correctly when passing in the association itself', function(assert) {
  let user = this.schema.create('user');
  let address = this.schema.create('address', {
    user
  });

  assert.equal(address.userId, user.id);
  assert.deepEqual(address.user.attrs, user.attrs);
  assert.equal(this.schema.db.users.length, 1);
  assert.deepEqual(this.schema.db.users[0], { id: '1' });
  assert.equal(this.schema.db.addresses.length, 1);
  assert.deepEqual(this.schema.db.addresses[0], { id: '1', userId: '1' });
});

test('it throws an error if a model is passed in without a defined relationship', function(assert) {
  let foo = this.schema.create('foo');
  assert.throws(function() {
    this.schema.create('address', {
      foo
    });
  }, /you haven't defined that key as an association on your model/);
});

test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
  this.schema.create('foo');
  this.schema.create('foo');

  assert.throws(function() {
    this.schema.create('address', {
      foos: this.schema.foos.all()
    });
  }, /you haven't defined that key as an association on your model/);
});
