import Helper, { states } from "./_helper";
import { module, test } from "qunit";

module("Integration | ORM | Mixed | One To Many | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, function(assert) {
      let [user, posts] = this.helper[state]();

      assert.equal(
        user.posts.models.length,
        posts.length,
        "the parent has the correct number of children"
      );
      assert.equal(
        user.postIds.length,
        posts.length,
        "the parent has the correct number of children ids"
      );

      posts.forEach(post => {
        assert.ok(user.posts.includes(post));

        if (post.isSaved()) {
          assert.ok(
            user.postIds.indexOf(post.id) > -1,
            "each saved child id is in parent.childrenIds array"
          );
        }

        // Check the inverse
        assert.deepEqual(post.user.attrs, user.attrs);
        assert.deepEqual(post.userId, user.id);
      });
    });
  });
});
