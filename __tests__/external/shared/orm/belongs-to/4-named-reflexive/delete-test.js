import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named Reflexive | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [user, bestFriend] = helper[state]();

      if (bestFriend) {
        bestFriend.destroy();
        user.reload();
      }

      expect(user.bestFriendId).toBeNil();
      expect(user.bestFriend).toBeNil();
    });
  });
});
