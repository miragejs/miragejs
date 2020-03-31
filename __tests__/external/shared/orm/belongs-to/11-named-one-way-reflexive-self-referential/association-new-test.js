import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named one-way reflexive self referential | association #new", () => {
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
      let [user] = helper[state]();

      let ganon = user.newRepresentative({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(user.representative).toEqual(ganon);
      expect(user.representativeId).toBeNil();

      user.save();

      expect(ganon.id).toBeTruthy();
      expect(user.representativeId).toEqual(ganon.id);
    });
  });
});
