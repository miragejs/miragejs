import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named Reflexive Explicit Inverse | association #set", () => {
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
      let [user] = helper[state]();
      let friend = helper.savedParent();

      user.bestFriend = friend;

      expect(user.bestFriendId).toEqual(friend.id);
      expect(user.bestFriend.attrs).toEqual(friend.attrs);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = helper[state]();
      let friend = helper.newParent();

      user.bestFriend = friend;

      expect(user.bestFriendId).toBeNil();
      expect(user.bestFriend.attrs).toEqual(friend.attrs);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [user] = helper[state]();

      user.bestFriend = null;

      expect(user.bestFriendId).toBeNil();
      expect(user.bestFriend).toBeNil();
    });
  });
});
