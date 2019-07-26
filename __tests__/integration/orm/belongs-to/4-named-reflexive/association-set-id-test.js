import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named Reflexive | association #setId", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, assert => {
      let [user] = this.helper[state]();
      let friend = this.helper.savedParent();

      user.bestFriendId = friend.id;

      expect(user.bestFriendId).toEqual(friend.id);
      expect(user.bestFriend.attrs).toEqual(friend.attrs);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach(state => {
    test(`a ${state} can clear its association via a null parentId`, assert => {
      let [user] = this.helper[state]();

      user.bestFriendId = null;

      expect(user.bestFriendId).toEqual(null);
      expect(user.bestFriend).toEqual(null);
    });
  });
});
