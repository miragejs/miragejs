import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-Way Reflexive | association #set", () => {
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

      child.user = savedParent;

      expect(child.userId).toEqual(savedParent.id);
      expect(child.user.attrs).toEqual(savedParent.attrs);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [child] = helper[state]();
      let newParent = helper.newParent();

      child.user = newParent;

      expect(child.userId).toBeNil();
      expect(child.user).toEqual(newParent);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [child] = helper[state]();

      child.user = null;

      expect(child.userId).toBeNil();
      expect(child.user).toBeNil();
    });
  });
});
