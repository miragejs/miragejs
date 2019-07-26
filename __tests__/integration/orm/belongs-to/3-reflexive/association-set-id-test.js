import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Reflexive | association #setId", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [user, originalUser] = this.helper[state]();
      let friend = this.helper.savedParent();

      user.userId = friend.id;

      expect(user.userId).toEqual(friend.id);
      expect(user.user.attrs).toEqual(friend.attrs);

      user.save();
      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toEqual(null);
      }
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach(state => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user, originalUser] = this.helper[state]();

      user.userId = null;

      expect(user.userId).toEqual(null);
      expect(user.user).toEqual(null);

      user.save();
      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toEqual(null);
      }
    });
  });
});
