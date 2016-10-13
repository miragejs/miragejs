import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting the parent updates the child's foreign key for a ${state}`, function(assert) {
    let [ post, user ] = this.helper[state]();

    if (user) {
      user.destroy();
      post.reload();
    }

    assert.equal(post.authorId, null);
    assert.deepEqual(post.author, null);
  });

});
