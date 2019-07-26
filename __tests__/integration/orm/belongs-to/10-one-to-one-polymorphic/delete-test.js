import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | One-to-one Polymorphic | delete", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, assert => {
      let [comment, post] = this.helper[state]();

      if (post) {
        post.destroy();
        comment.reload();
      }

      expect(comment.commentableId).toEqual(null);
      expect(comment.commentable).toEqual(null);
    });
  });
});
