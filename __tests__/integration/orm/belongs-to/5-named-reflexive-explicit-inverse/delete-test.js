import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named Reflexive Explicit Inverse | delete", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [user, bestFriend] = this.helper[state]();

      if (bestFriend) {
        bestFriend.destroy();
        user.reload();
      }

      expect(user.bestFriendId).toEqual(null);
      expect(user.bestFriend).toEqual(null);
    });
  });
});
