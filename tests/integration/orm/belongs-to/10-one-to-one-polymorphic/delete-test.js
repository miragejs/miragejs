import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting the parent updates the child's foreign key for a ${state}`, function(assert) {
    let [ comment, post ] = this.helper[state]();

    if (post) {
      post.destroy();
      comment.reload();
    }

    assert.equal(comment.commentableId, null);
    assert.deepEqual(comment.commentable, null);
  });

});
