import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Reflexive | association #setId", () => {
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
      let [user, originalUser] = helper[state]();
      let friend = helper.savedParent();

      user.userId = friend.id;

      expect(user.userId).toEqual(friend.id);
      expect(user.user.attrs).toEqual(friend.attrs);

      user.save();
      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toBeNil();
      }
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach((state) => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user, originalUser] = helper[state]();

      user.userId = null;

      expect(user.userId).toBeNil();
      expect(user.user).toBeNil();

      user.save();
      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toBeNil();
      }
    });
  });
});
