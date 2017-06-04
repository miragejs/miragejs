import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many-to-many Polymorphic | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the parent accepts a saved child id', function(assert) {
  let post = this.helper.savedChild();
  let user = this.schema.users.new({
    commentableIds: [ { type: 'post', id: post.id } ]
  });

  assert.deepEqual(user.commentableIds, [ { type: 'post', id: post.id } ]);
  assert.ok(user.commentables.includes(post));
});

test('the parent errors if the children ids don\'t exist', function(assert) {
  assert.throws(function() {
    this.schema.users.new({ commentableIds: [ { type: 'post', id: 2 } ] });
  }, /You're instantiating a user that has a commentableIds of post:2, but some of those records don't exist in the database/);
});

test('the parent accepts null children foreign key', function(assert) {
  let user = this.schema.users.new({ commentableIds: null });

  assert.equal(user.commentables.models.length, 0);
  assert.deepEqual(user.commentableIds, []);
  assert.deepEqual(user.attrs, { commentableIds: null });
});

test('the parent accepts saved children', function(assert) {
  let post = this.helper.savedChild();
  let user = this.schema.users.new({ commentables: [ post ] });

  assert.deepEqual(user.commentableIds, [ { type: 'post', id: post.id } ]);
  assert.ok(user.commentables.includes(post));
});

test('the parent accepts new children', function(assert) {
  let post = this.schema.posts.new({ title: 'Lorem' });
  let user = this.schema.users.new({ commentables: [ post ] });

  assert.deepEqual(user.commentableIds, [ { type: 'post', id: undefined } ]);
  assert.ok(user.commentables.includes(post));
});

test('the parent accepts null children', function(assert) {
  let user = this.schema.users.new({ commentables: null });

  assert.equal(user.commentables.models.length, 0);
  assert.deepEqual(user.commentableIds, []);
  assert.deepEqual(user.attrs, { commentableIds: null });
});

test('the parent accepts children and child ids', function(assert) {
  let post = this.helper.savedChild();
  let user = this.schema.users.new({ commentables: [ post ], commentableIds: [ { type: 'post', id: post.id } ] });

  assert.deepEqual(user.commentableIds, [ { type: 'post', id: post.id } ]);
  assert.ok(user.commentables.includes(post));
});

test('the parent accepts no reference to children or child ids as empty obj', function(assert) {
  let user = this.schema.users.new({});

  assert.deepEqual(user.commentableIds, []);
  assert.deepEqual(user.commentables.models, []);
  assert.deepEqual(user.attrs, { commentableIds: null });
});

test('the parent accepts no reference to children or child ids', function(assert) {
  let user = this.schema.users.new();

  assert.deepEqual(user.commentableIds, []);
  assert.deepEqual(user.commentables.models, []);
  assert.deepEqual(user.attrs, { commentableIds: null });
});
