import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | association #setId', {
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
    let savedPost = this.helper.savedParent();

    comment.commentableId = { id: savedPost.id, type: 'post' };

    assert.deepEqual(comment.commentableId, { id: savedPost.id, type: 'post' });
    assert.deepEqual(comment.commentable.attrs, savedPost.attrs);
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
    assert.deepEqual(comment.commentable, null);
  });

});
