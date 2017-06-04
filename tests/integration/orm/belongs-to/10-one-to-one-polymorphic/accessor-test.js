import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The reference to a belongs-to association is correct, for all states
*/
states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ comment, post ] = this.helper[state]();

    // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
    if (post) {
      assert.deepEqual(comment.commentable.attrs, post.attrs, 'the model reference is correct');
      assert.deepEqual(comment.commentableId, { type: 'post', id: post.id }, 'the modelId reference is correct');
    } else {
      assert.deepEqual(comment.commentable, null, 'the model reference is correct');
      assert.equal(comment.commentableId, null, 'the modelId reference is correct');
    }

    // If there's a post in this state, make sure the inverse association is correct
    if (post) {
      assert.deepEqual(post.comment.attrs, comment.attrs, 'the inverse model reference is correct');
      assert.equal(post.commentId, comment.id, 'the inverse modelId reference is correct');
    }
  });

});
