import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Basic | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the parent accepts a saved child id', function(assert) {
  let post = this.helper.savedChild();
  let user = this.schema.users.new({
    postIds: [ post.id ]
  });

  assert.deepEqual(user.postIds, [ post.id ]);
  assert.deepEqual(user.posts.models[0], post);
});

test('the parent errors if the children ids don\'t exist', function(assert) {
  assert.throws(function() {
    this.schema.users.new({ postIds: [ 2 ] });
  }, /You're instantiating a user that has a postIds of 2, but some of those records don't exist in the database/);
});

test('the parent accepts null children foreign key', function(assert) {
  let user = this.schema.users.new({ postIds: null });

  assert.equal(user.posts.models.length, 0);
  assert.deepEqual(user.postIds, []);
  assert.deepEqual(user.attrs, { postIds: null });
});

test('the parent accepts saved children', function(assert) {
  let post = this.helper.savedChild();
  let user = this.schema.users.new({ posts: [ post ] });

  assert.deepEqual(user.postIds, [ post.id ]);
  assert.deepEqual(user.posts.models[0], post);
});

test('the parent accepts new children', function(assert) {
  let post = this.schema.posts.new({ title: 'Lorem' });
  let user = this.schema.users.new({ posts: [ post ] });

  assert.deepEqual(user.postIds, [ undefined ]);
  assert.deepEqual(user.posts.models[0], post);
});

test('the parent accepts null children', function(assert) {
  let user = this.schema.users.new({ posts: null });

  assert.equal(user.posts.models.length, 0);
  assert.deepEqual(user.postIds, []);
  assert.deepEqual(user.attrs, { postIds: null });
});

test('the parent accepts children and child ids', function(assert) {
  let post = this.helper.savedChild();
  let user = this.schema.users.new({ posts: [ post ], postIds: [ post.id ] });

  assert.deepEqual(user.postIds, [ post.id ]);
  assert.deepEqual(user.posts.models[0], post);
});

test('the parent accepts no reference to children or child ids as empty obj', function(assert) {
  let user = this.schema.users.new({});

  assert.deepEqual(user.postIds, []);
  assert.deepEqual(user.posts.models, []);
  assert.deepEqual(user.attrs, { postIds: null });
});

test('the parent accepts no reference to children or child ids', function(assert) {
  let user = this.schema.users.new();

  assert.deepEqual(user.postIds, []);
  assert.deepEqual(user.posts.models, []);
  assert.deepEqual(user.attrs, { postIds: null });
});
