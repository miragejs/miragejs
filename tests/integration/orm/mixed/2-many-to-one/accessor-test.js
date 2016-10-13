import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | Many To One | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The reference to a belongs-to association is correct, for all states
*/
states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ post, user ] = this.helper[state]();

    assert.deepEqual(post.user, user);
    assert.equal(post.userId, user ? user.id : null);

    post.save();

    // Check the inverse
    if (user && user.isSaved()) {
      user.reload();
      assert.ok(user.posts.includes(post));
    }
  });

});
