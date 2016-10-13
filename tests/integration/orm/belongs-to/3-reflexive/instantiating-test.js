import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Reflexive | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let friend = this.helper.savedParent();
  let user = this.schema.users.new({ userId: friend.id });

  assert.equal(user.userId, friend.id);
  assert.deepEqual(user.user.attrs, friend.attrs);
  assert.deepEqual(user.attrs, { userId: friend.id });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.users.new({ userId: 2 });
  }, /You're instantiating a user that has a userId of 2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let user = this.schema.users.new({ userId: null });

  assert.equal(user.userId, null);
  assert.equal(user.user, null);
  assert.deepEqual(user.attrs, { userId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let friend = this.helper.savedParent();
  let user = this.schema.users.new({ user: friend });

  assert.equal(user.userId, 1);
  assert.deepEqual(user.user.attrs, friend.attrs);
  assert.deepEqual(user.attrs, { userId: null }); // this would update when saved
});

test('the child accepts a new parent model', function(assert) {
  let zelda = this.schema.users.new({ name: 'Zelda' });
  let user = this.schema.users.new({ user: zelda });

  assert.equal(user.userId, null);
  assert.deepEqual(user.user, zelda);
  assert.deepEqual(user.attrs, { userId: null });
});

test('the child accepts a null parent model', function(assert) {
  let user = this.schema.users.new({ user: null });

  assert.equal(user.userId, null);
  assert.deepEqual(user.user, null);
  assert.deepEqual(user.attrs, { userId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let friend = this.helper.savedParent();
  let user = this.schema.users.new({ user: friend, userId: friend.id });

  assert.equal(user.userId, '1');
  assert.deepEqual(user.user, friend);
  assert.deepEqual(user.attrs, { userId: friend.id });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let user = this.schema.users.new({});

  assert.equal(user.userId, null);
  assert.deepEqual(user.user, null);
  assert.deepEqual(user.attrs, { userId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let user = this.schema.users.new();

  assert.equal(user.userId, null);
  assert.deepEqual(user.user, null);
  assert.deepEqual(user.attrs, { userId: null });
});
