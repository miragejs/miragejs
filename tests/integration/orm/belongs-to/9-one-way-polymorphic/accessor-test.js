import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | accessor', {
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

    assert.deepEqual(comment.commentable, post ? post : null, 'the model reference is correct');
    assert.deepEqual(comment.commentableId, post ? { id: post.id, type: 'post' } : null, 'the modelId reference is correct');
  });

});
