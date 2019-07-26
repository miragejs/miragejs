import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-Way Reflexive | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, assert => {
      let [user, parent] = this.helper[state]();

      // We use .attrs here to avoid infinite recursion
      if (parent) {
        expect(user.user.attrs).toEqual(parent.attrs);
        expect(user.userId).toEqual(parent.id);
      } else {
        expect(user.user).toEqual(null);
        expect(user.userId).toEqual(null);
      }
    });
  });
});
