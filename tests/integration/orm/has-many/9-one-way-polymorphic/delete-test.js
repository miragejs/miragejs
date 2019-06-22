import Helper, { states } from "./_helper";
import { module, test } from "qunit";

module("Integration | ORM | Has Many | One-way Polymorphic | delete", function(
  hooks
) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting children updates the parent's foreign key for a ${state}`, function(assert) {
      let [user, posts] = this.helper[state]();

      if (posts && posts.length) {
        posts.forEach(p => p.destroy());
        user.reload();
      }

      assert.equal(user.things.length, 0);
      assert.equal(user.thingIds.length, 0);
    });
  });
});
