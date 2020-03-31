import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named One-Way Reflexive | association #new", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {
    test(`a ${state} can build a new associated parent`, () => {
      let [child] = helper[state]();

      let ganon = child.newParent({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(child.parent).toEqual(ganon);
      expect(child.parentId).toBeNil();

      child.save();

      expect(ganon.id).toBeTruthy();
      expect(child.parentId).toEqual(ganon.id);
    });
  });
});
