import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One To One | delete", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [user, profile] = this.helper[state]();

      if (profile) {
        profile.destroy();
        user.reload();
      }

      expect(user.profileId).toEqual(null);
      expect(user.profile).toEqual(null);
    });
  });
});
