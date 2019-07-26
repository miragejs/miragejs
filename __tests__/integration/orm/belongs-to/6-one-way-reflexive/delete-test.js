import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-Way Reflexive | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [user, targetUser] = helper[state]();

      if (targetUser) {
        targetUser.destroy();
        user.reload();
      }

      expect(user.userId).toBeNull();
      expect(user.user).toBeNull();
    });
  });
});
