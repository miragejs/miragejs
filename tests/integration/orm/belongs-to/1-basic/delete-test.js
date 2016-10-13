import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting the parent updates the child's foreign key for a ${state}`, function(assert) {
    let [ post, author ] = this.helper[state]();

    if (author) {
      author.destroy();
      post.reload();
    }

    assert.equal(post.authorId, null);
    assert.deepEqual(post.author, null);
  });

});
