import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named Reflexive Explicit Inverse | association #new", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, () => {
      let [user] = this.helper[state]();

      let ganon = user.newBestFriend({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(user.bestFriend).toEqual(ganon);
      expect(user.bestFriendId).toEqual(null);

      user.save();

      expect(ganon.id).toBeTruthy();
      expect(user.bestFriendId).toEqual(ganon.id);
    });
  });
});
