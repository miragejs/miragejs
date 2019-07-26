import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | Reflexive | delete", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, assert => {
      let [user, targetUser] = this.helper[state]();

      if (targetUser) {
        targetUser.destroy();
        user.reload();
      }

      expect(user.userId).toEqual(null);
      expect(user.user).toEqual(null);
    });
  });
});
