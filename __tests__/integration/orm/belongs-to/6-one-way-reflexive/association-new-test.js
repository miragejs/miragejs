import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-Way Reflexive | association #new", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, () => {
      let [child] = helper[state]();

      let ganon = child.newUser({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(child.user).toEqual(ganon);
      expect(child.userId).toBeNil();

      child.save();

      expect(ganon.id).toBeTruthy();
      expect(child.userId).toEqual(ganon.id);
    });
  });
});
