import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | association #set', {
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
    let savedPost = this.helper.savedParent();

    comment.commentable = savedPost;

    assert.deepEqual(comment.commentableId, { id: savedPost.id, type: 'post' });
    assert.deepEqual(comment.commentable, savedPost);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ comment ] = this.helper[state]();
    let newPost = this.helper.newParent();

    comment.commentable = newPost;

    assert.deepEqual(comment.commentableId, { id: undefined, type: 'post' });
    assert.deepEqual(comment.commentable, newPost);
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ comment ] = this.helper[state]();

    comment.commentable = null;

    assert.equal(comment.commentableId, null);
    assert.deepEqual(comment.commentable, null);
  });

});
