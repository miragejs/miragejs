import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named Reflexive | association #setId", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [user] = helper[state]();
      let friend = helper.savedParent();

      user.bestFriendId = friend.id;

      expect(user.bestFriendId).toEqual(friend.id);
      expect(user.bestFriend.attrs).toEqual(friend.attrs);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach((state) => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user] = helper[state]();

      user.bestFriendId = null;

      expect(user.bestFriendId).toBeNil();
      expect(user.bestFriend).toBeNil();
    });
  });
});
