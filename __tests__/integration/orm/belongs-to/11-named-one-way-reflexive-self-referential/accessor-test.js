import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named one-way reflexive self referential | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, () => {
      let [user, representative] = this.helper[state]();

      // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
      if (representative) {
        expect(user.representative.attrs).toEqual(representative.attrs);
        expect(user.representativeId).toEqual(representative.id);
      } else {
        expect(user.representative).toEqual(null);
        expect(user.representativeId).toEqual(null);
      }
    });
  });
});
