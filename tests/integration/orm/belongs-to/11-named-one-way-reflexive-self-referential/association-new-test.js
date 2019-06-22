import Helper, { states } from "./_helper";
import { module, test } from "qunit";

module(
  "Integration | ORM | Belongs To | Named one-way reflexive self referential | association #new",
  function(hooks) {
    hooks.beforeEach(function() {
      this.helper = new Helper();
    });

    /*
    The model can make a new unsaved belongs-to association, for all states
  */

    states.forEach(state => {
      test(`a ${state} can build a new associated parent`, function(assert) {
        let [user] = this.helper[state]();

        let ganon = user.newRepresentative({ name: "Ganon" });

        assert.ok(!ganon.id, "the parent was not persisted");
        assert.deepEqual(user.representative, ganon);
        assert.equal(user.representativeId, null);

        user.save();

        assert.ok(ganon.id, "saving the child persists the parent");
        assert.equal(
          user.representativeId,
          ganon.id,
          "the childs fk was updated"
        );
      });
    });
  }
);
