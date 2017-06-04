import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | create', {
  beforeEach() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  }
});

test('it sets up associations correctly when passing in the foreign key', function(assert) {
  let { schema } = this.helper;
  let post = schema.create('post');
  let comment = schema.create('comment', {
    commentableId: { type: 'post', id: post.id }
  });
  post.reload();

  assert.deepEqual(comment.commentableId, { type: 'post', id: post.id });
  assert.deepEqual(comment.commentable.attrs, post.attrs);
  assert.deepEqual(post.comment.attrs, comment.attrs);
  assert.equal(schema.db.comments.length, 1);
  assert.equal(schema.db.posts.length, 1);
  assert.deepEqual(schema.db.comments[0], { id: '1', commentableId: { type: 'post', id: '1' } });
  assert.deepEqual(schema.db.posts[0], { id: '1', commentId: '1' });
});

test('it sets up associations correctly when passing in the association itself', function(assert) {
  let { schema } = this.helper;
  let post = schema.create('post');
  let comment = schema.create('comment', {
    commentable: post
  });

  assert.deepEqual(comment.commentableId, { type: 'post', id: post.id });
  assert.deepEqual(comment.commentable.attrs, post.attrs);
  assert.deepEqual(post.comment.attrs, comment.attrs);
  assert.equal(schema.db.comments.length, 1);
  assert.equal(schema.db.posts.length, 1);
  assert.deepEqual(schema.db.comments[0], { id: '1', commentableId: { type: 'post', id: '1' } });
  assert.deepEqual(schema.db.posts[0], { id: '1', commentId: '1' });
});

test('it throws an error if a model is passed in without a defined relationship', function(assert) {
  let { schema } = this.helper;

  assert.throws(function() {
    schema.create('comment', {
      foo: schema.create('foo')
    });
  }, /you haven't defined that key as an association on your model/);
});

test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
  let { schema } = this.helper;
  schema.create('foo');
  schema.create('foo');

  assert.throws(function() {
    schema.create('comment', {
      foos: schema.foos.all()
    });
  }, /you haven't defined that key as an association on your model/);
});
