import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | association #setId', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ comment ] = this.helper[state]();
    let post = this.helper.savedParent();

    comment.commentableId = { type: 'post', id: post.id };

    assert.deepEqual(comment.commentableId, { type: 'post', id: post.id });
    assert.deepEqual(comment.commentable.attrs, post.attrs);

    comment.save();
    post.reload();

    assert.equal(post.commentId, comment.id, 'the inverse was set');
    assert.deepEqual(post.comment.attrs, comment.attrs);
  });

});

[
  'savedChildSavedParent',
  'newChildSavedParent'
].forEach((state) => {

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ comment ] = this.helper[state]();

    comment.commentableId = null;

    assert.equal(comment.commentableId, null);
    assert.equal(comment.commentable, null);
  });

});
