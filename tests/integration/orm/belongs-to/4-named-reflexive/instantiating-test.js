import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named Reflexive | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let friend = this.helper.savedParent();
  let user = this.schema.users.new({ bestFriendId: friend.id });

  assert.equal(user.bestFriendId, friend.id);
  assert.deepEqual(user.bestFriend.attrs, friend.attrs);
  assert.deepEqual(user.attrs, { bestFriendId: friend.id });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.users.new({ bestFriendId: 2 });
  }, /You're instantiating a user that has a bestFriendId of 2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let user = this.schema.users.new({ bestFriendId: null });

  assert.equal(user.bestFriendId, null);
  assert.equal(user.bestFriend, null);
  assert.deepEqual(user.attrs, { bestFriendId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let friend = this.helper.savedParent();
  let user = this.schema.users.new({ bestFriend: friend });

  assert.equal(user.bestFriendId, 1);
  assert.deepEqual(user.bestFriend.attrs, friend.attrs);
  assert.deepEqual(user.attrs, { bestFriendId: null }); // this would update when saved
});

test('the child accepts a new parent model', function(assert) {
  let zelda = this.schema.users.new({ name: 'Zelda' });
  let user = this.schema.users.new({ bestFriend: zelda });

  assert.equal(user.bestFriendId, null);
  assert.deepEqual(user.bestFriend, zelda);
  assert.deepEqual(user.attrs, { bestFriendId: null });
});

test('the child accepts a null parent model', function(assert) {
  let user = this.schema.users.new({ bestFriend: null });

  assert.equal(user.bestFriendId, null);
  assert.deepEqual(user.bestFriend, null);
  assert.deepEqual(user.attrs, { bestFriendId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let friend = this.helper.savedParent();
  let user = this.schema.users.new({ bestFriend: friend, bestFriendId: friend.id });

  assert.equal(user.bestFriendId, '1');
  assert.deepEqual(user.bestFriend, friend);
  assert.deepEqual(user.attrs, { bestFriendId: friend.id });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let user = this.schema.users.new({});

  assert.equal(user.bestFriendId, null);
  assert.deepEqual(user.bestFriend, null);
  assert.deepEqual(user.attrs, { bestFriendId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let user = this.schema.users.new();

  assert.equal(user.bestFriendId, null);
  assert.deepEqual(user.bestFriend, null);
  assert.deepEqual(user.attrs, { bestFriendId: null });
});
