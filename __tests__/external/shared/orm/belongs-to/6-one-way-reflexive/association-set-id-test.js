import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-Way Reflexive | association #setId", () => {
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

      child.userId = savedParent.id;

      expect(child.userId).toEqual(savedParent.id);
      expect(child.user.attrs).toEqual(savedParent.attrs);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach((state) => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [child] = helper[state]();

      child.userId = null;

      expect(child.userId).toBeNil();
      expect(child.user).toBeNil();
    });
  });
});
