import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent`, function(assert) {
    let [ comment ] = this.helper[state]();
    let post = this.helper.savedParent();

    comment.commentable = post;

    assert.deepEqual(comment.commentableId, { type: 'post', id: post.id });
    assert.deepEqual(comment.commentable.attrs, post.attrs);
    assert.equal(post.commentId, comment.id, 'the inverse was set');
    assert.deepEqual(post.comment.attrs, comment.attrs);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ comment ] = this.helper[state]();
    let post = this.helper.newParent();

    comment.commentable = post;

    assert.deepEqual(comment.commentableId, { type: 'post', id: undefined });
    assert.deepEqual(comment.commentable.attrs, post.attrs);

    assert.equal(post.commentId, comment.id, 'the inverse was set');
    assert.deepEqual(post.comment.attrs, comment.attrs);
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ comment ] = this.helper[state]();

    comment.commentable = null;

    assert.equal(comment.commentableId, null);
    assert.deepEqual(comment.commentable, null);
  });

});
