import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named One-Way Reflexive | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [child] = helper[state]();
      let savedParent = helper.savedParent();

      child.parent = savedParent;

      expect(child.parentId).toEqual(savedParent.id);
      expect(child.parent.attrs).toEqual(savedParent.attrs);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [child] = helper[state]();
      let newParent = helper.newParent();

      child.parent = newParent;

      expect(child.parentId).toBeNil();
      expect(child.parent).toEqual(newParent);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [child] = helper[state]();

      child.parent = null;

      expect(child.parentId).toBeNil();
      expect(child.parent).toBeNil();
    });
  });
});
