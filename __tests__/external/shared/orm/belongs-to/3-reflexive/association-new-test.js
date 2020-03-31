import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Reflexive | association #new", () => {
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
      let [user, originalUser] = helper[state]();

      let ganon = user.newUser({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(user.user).toEqual(ganon);
      expect(user.userId).toBeNil();
      expect(ganon.user).toEqual(user);

      user.save();

      expect(ganon.id).toBeTruthy();
      expect(user.userId).toEqual(ganon.id);

      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toBeNil();
      }
    });
  });
});
