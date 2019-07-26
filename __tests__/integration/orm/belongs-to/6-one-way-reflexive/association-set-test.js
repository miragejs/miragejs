import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-Way Reflexive | association #set", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [child] = this.helper[state]();
      let savedParent = this.helper.savedParent();

      child.user = savedParent;

      expect(child.userId).toEqual(savedParent.id);
      expect(child.user.attrs).toEqual(savedParent.attrs);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [child] = this.helper[state]();
      let newParent = this.helper.newParent();

      child.user = newParent;

      expect(child.userId).toEqual(null);
      expect(child.user).toEqual(newParent);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [child] = this.helper[state]();

      child.user = null;

      expect(child.userId).toEqual(null);
      expect(child.user).toEqual(null);
    });
  });
});
