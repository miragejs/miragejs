import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | Many To One | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, function(assert) {
      let [ post, user ] = this.helper[state]();

      if (post.user) {
        assert.ok(post.user.equals(user));
      } else {
        assert.equal(post.user, null);
        assert.equal(user, null);
      }
      assert.equal(post.userId, user ? user.id : null);

      post.save();

      // Check the inverse
      if (user && user.isSaved()) {
        user.reload();
        assert.ok(user.posts.includes(post));
      }
    });

  });
});
