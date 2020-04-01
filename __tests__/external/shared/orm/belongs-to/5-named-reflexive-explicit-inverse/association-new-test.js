import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named Reflexive Explicit Inverse | association #new", () => {
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

      let ganon = user.newBestFriend({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(user.bestFriend).toEqual(ganon);
      expect(user.bestFriendId).toBeNil();

      user.save();

      expect(ganon.id).toBeTruthy();
      expect(user.bestFriendId).toEqual(ganon.id);
    });
  });
});
