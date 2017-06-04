import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | create', {
  beforeEach() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  }
});

test('it sets up associations correctly when passing in the foreign key', function(assert) {
  let post = this.helper.schema.create('post');
  let comment = this.helper.schema.create('comment', {
    commentableId: { id: post.id, type: 'post' }
  });

  assert.deepEqual(comment.commentableId, { id: post.id, type: 'post' });
  assert.deepEqual(comment.commentable.attrs, post.attrs);
  assert.equal(this.helper.schema.db.posts.length, 1);
  assert.deepEqual(this.helper.schema.db.posts[0], { id: '1' });
  assert.equal(this.helper.schema.db.comments.length, 1);
  assert.deepEqual(this.helper.schema.db.comments[0], { id: '1', commentableId: { id: '1', type: 'post' } });
});

test('it sets up associations correctly when passing in the association itself', function(assert) {
  let post = this.helper.schema.create('post');
  let comment = this.helper.schema.create('comment', {
    commentable: post
  });

  assert.deepEqual(comment.commentableId, { id: post.id, type: 'post' });
  assert.deepEqual(comment.commentable.attrs, post.attrs);
  assert.equal(this.helper.schema.db.posts.length, 1);
  assert.deepEqual(this.helper.schema.db.posts[0], { id: '1' });
  assert.equal(this.helper.schema.db.comments.length, 1);
  assert.deepEqual(this.helper.schema.db.comments[0], { id: '1', commentableId: { id: '1', type: 'post' } });
});
