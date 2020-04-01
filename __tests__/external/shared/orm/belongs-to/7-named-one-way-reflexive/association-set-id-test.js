import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named One-Way Reflexive | association #setId", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [child] = helper[state]();
      let savedParent = helper.savedParent();

      child.parentId = savedParent.id;

      expect(child.parentId).toEqual(savedParent.id);
      expect(child.parent.attrs).toEqual(savedParent.attrs);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach((state) => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [child] = helper[state]();

      child.parentId = null;

      expect(child.parentId).toBeNil();
      expect(child.parent).toBeNil();
    });
  });
});
