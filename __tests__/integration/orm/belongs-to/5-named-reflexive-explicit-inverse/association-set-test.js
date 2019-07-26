import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named Reflexive Explicit Inverse | association #set", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [user] = this.helper[state]();
      let friend = this.helper.savedParent();

      user.bestFriend = friend;

      expect(user.bestFriendId).toEqual(friend.id);
      expect(user.bestFriend.attrs).toEqual(friend.attrs);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = this.helper[state]();
      let friend = this.helper.newParent();

      user.bestFriend = friend;

      expect(user.bestFriendId).toEqual(null);
      expect(user.bestFriend.attrs).toEqual(friend.attrs);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [user] = this.helper[state]();

      user.bestFriend = null;

      expect(user.bestFriendId).toEqual(null);
      expect(user.bestFriend).toEqual(null);
    });
  });
});
