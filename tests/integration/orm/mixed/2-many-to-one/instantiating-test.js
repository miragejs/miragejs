import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let user = this.helper.savedParent();
  let post = this.schema.posts.new({ userId: user.id });

  assert.equal(post.userId, user.id);
  assert.deepEqual(post.user.attrs, user.attrs);
  assert.deepEqual(post.attrs, { userId: user.id });

  post.save();
  user.reload();

  assert.ok(user.posts.includes(post), 'the inverse was set');
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.posts.new({ userId: 2 });
  }, /You're instantiating a post that has a userId of 2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let post = this.schema.posts.new({ userId: null });

  assert.equal(post.userId, null);
  assert.equal(post.user, null);
  assert.deepEqual(post.attrs, { userId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let user = this.helper.savedParent();
  let post = this.schema.posts.new({ user });

  assert.equal(post.userId, 1);
  assert.deepEqual(post.user.attrs, user.attrs);
  assert.deepEqual(post.attrs, { userId: null });

  post.save();
  user.reload();

  assert.ok(user.posts.includes(post), 'the inverse was set');
});

test('the child accepts a new parent model', function(assert) {
  let user = this.schema.users.new({ age: 300 });
  let post = this.schema.posts.new({ user });

  assert.equal(post.userId, null);
  assert.deepEqual(post.user, user);
  assert.deepEqual(post.attrs, { userId: null });
  assert.ok(user.posts.includes(post), 'the inverse was set');
});

test('the child accepts a null parent model', function(assert) {
  let post = this.schema.posts.new({ user: null });

  assert.equal(post.userId, null);
  assert.deepEqual(post.user, null);
  assert.deepEqual(post.attrs, { userId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let user = this.helper.savedParent();
  let post = this.schema.posts.new({ user, userId: user.id });

  assert.equal(post.userId, '1');
  assert.deepEqual(post.user, user);
  assert.deepEqual(post.attrs, { userId: user.id });

  assert.ok(user.posts.includes(post), 'the inverse was set');
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let post = this.schema.posts.new({});

  assert.equal(post.userId, null);
  assert.deepEqual(post.user, null);
  assert.deepEqual(post.attrs, { userId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let post = this.schema.posts.new();

  assert.equal(post.userId, null);
  assert.deepEqual(post.user, null);
  assert.deepEqual(post.attrs, { userId: null });
});
