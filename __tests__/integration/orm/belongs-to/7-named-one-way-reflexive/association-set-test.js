import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | Named One-Way Reflexive | association #set", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, assert => {
      let [child] = this.helper[state]();
      let savedParent = this.helper.savedParent();

      child.parent = savedParent;

      expect(child.parentId).toEqual(savedParent.id);
      expect(child.parent.attrs).toEqual(savedParent.attrs);
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [child] = this.helper[state]();
      let newParent = this.helper.newParent();

      child.parent = newParent;

      expect(child.parentId).toEqual(null);
      expect(child.parent).toEqual(newParent);
    });

    test(`a ${state} can update its association to a null parent`, assert => {
      let [child] = this.helper[state]();

      child.parent = null;

      expect(child.parentId).toEqual(null);
      expect(child.parent).toEqual(null);
    });
  });
});
