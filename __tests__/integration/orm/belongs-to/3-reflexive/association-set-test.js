import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Reflexive | association #set", () => {
  let helper; beforeEach(() => {
    helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [user, originalUser] = helper[state]();
      let friend = helper.savedParent();

      user.user = friend;

      expect(user.userId).toEqual(friend.id);
      expect(user.user.attrs).toEqual(friend.attrs);

      user.save();
      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toEqual(null);
      }
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user, originalUser] = helper[state]();
      let friend = helper.newParent();

      user.user = friend;

      expect(user.userId).toEqual(null);
      expect(user.user.attrs).toEqual(friend.attrs);

      user.save();
      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toEqual(null);
      }
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [user, originalUser] = helper[state]();

      user.user = null;

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
