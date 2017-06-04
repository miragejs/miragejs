import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let post = this.helper.savedParent();
  let comment = this.schema.comments.new({ commentableId: { type: 'post', id: post.id } });

  assert.deepEqual(comment.commentableId, { type: 'post', id: post.id });
  assert.deepEqual(comment.commentable.attrs, post.attrs);
  assert.deepEqual(comment.attrs, { commentableId: { type: 'post', id: post.id } });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.comments.new({ commentableId: { type: 'post', id: 2 } });
  }, /You're instantiating a comment that has a commentableId of post:2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let comment = this.schema.comments.new({ commentableId: null });

  assert.equal(comment.commentableId, null);
  assert.equal(comment.commentable, null);
  assert.deepEqual(comment.attrs, { commentableId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let post = this.helper.savedParent();
  let comment = this.schema.comments.new({ commentable: post });

  assert.deepEqual(comment.commentableId, { type: 'post', id: post.id });
  assert.deepEqual(comment.commentable.attrs, post.attrs);
  assert.deepEqual(comment.attrs, { commentableId: null }); // this would update when saved
});

test('the child accepts a new parent model', function(assert) {
  let post = this.schema.posts.new({ age: 300 });
  let comment = this.schema.comments.new({ commentable: post });

  assert.deepEqual(comment.commentableId, { type: 'post', id: undefined });
  assert.deepEqual(comment.commentable, post);
  assert.deepEqual(comment.attrs, { commentableId: null });
});

test('the child accepts a null parent model', function(assert) {
  let comment = this.schema.comments.new({ commentable: null });

  assert.equal(comment.commentableId, null);
  assert.deepEqual(comment.commentable, null);
  assert.deepEqual(comment.attrs, { commentableId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let post = this.helper.savedParent();
  let comment = this.schema.comments.new({ commentable: post, commentableId: { type: 'post', id: post.id } });

  assert.deepEqual(comment.commentableId, { type: 'post', id: '1' });
  assert.deepEqual(comment.commentable, post);
  assert.deepEqual(comment.attrs, { commentableId: { type: 'post', id: post.id } });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let comment = this.schema.comments.new({});

  assert.equal(comment.commentableId, null);
  assert.deepEqual(comment.commentable, null);
  assert.deepEqual(comment.attrs, { commentableId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let comment = this.schema.comments.new();

  assert.equal(comment.commentableId, null);
  assert.deepEqual(comment.commentable, null);
  assert.deepEqual(comment.attrs, { commentableId: null });
});
