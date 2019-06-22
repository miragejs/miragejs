import Helper, { states } from "./_helper";
import { module, test } from "qunit";

module("Integration | ORM | Has Many | Reflexive | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`the references of a ${state} are correct`, function(assert) {
      let [tag, tags] = this.helper[state]();

      assert.equal(
        tag.tags.models.length,
        tags.length,
        "the parent has the correct number of children"
      );
      assert.equal(
        tag.tagIds.length,
        tags.length,
        "the parent has the correct number of children ids"
      );

      tags.forEach(t => {
        assert.ok(tag.tags.includes(t));

        if (t.isSaved()) {
          assert.ok(
            tag.tagIds.indexOf(t.id) > -1,
            "each saved child id is in parent.childrenIds array"
          );
        }

        // Check the inverse
        assert.ok(t.tags.includes(tag));
      });
    });
  });
});
