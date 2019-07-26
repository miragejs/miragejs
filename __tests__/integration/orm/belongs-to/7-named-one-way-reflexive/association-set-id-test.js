import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named One-Way Reflexive | association #setId", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [child] = this.helper[state]();
      let savedParent = this.helper.savedParent();

      child.parentId = savedParent.id;

      expect(child.parentId).toEqual(savedParent.id);
      expect(child.parent.attrs).toEqual(savedParent.attrs);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach(state => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [child] = this.helper[state]();

      child.parentId = null;

      expect(child.parentId).toEqual(null);
      expect(child.parent).toEqual(null);
    });
  });
});
