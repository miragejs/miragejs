import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-Way Reflexive | delete", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [user, targetUser] = this.helper[state]();

      if (targetUser) {
        targetUser.destroy();
        user.reload();
      }

      expect(user.userId).toEqual(null);
      expect(user.user).toEqual(null);
    });
  });
});
