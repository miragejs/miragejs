import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Reflexive | association #new", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, () => {
      let [user, originalUser] = this.helper[state]();

      let ganon = user.newUser({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(user.user).toEqual(ganon);
      expect(user.userId).toEqual(null);
      expect(ganon.user).toEqual(user);

      user.save();

      expect(ganon.id).toBeTruthy();
      expect(user.userId).toEqual(ganon.id);

      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toEqual(null);
      }
    });
  });
});
