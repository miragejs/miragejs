import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One To One | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [user, profile] = helper[state]();

      if (profile) {
        profile.destroy();
        user.reload();
      }

      expect(user.profileId).toBeNil();
      expect(user.profile).toBeNil();
    });
  });
});
