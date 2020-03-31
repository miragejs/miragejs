import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One To One | association #new", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {
    test(`a ${state} can build a new associated parent`, () => {
      let [user] = helper[state]();

      let profile = user.newProfile({ age: 300 });

      expect(!profile.id).toBeTruthy();
      expect(user.profile).toEqual(profile);
      expect(user.profileId).toBeNil();
      expect(profile.user).toEqual(user);
      expect(profile.userId).toEqual(user.id);

      user.save();

      expect(profile.id).toBeTruthy();
      expect(user.profileId).toEqual(profile.id);
    });
  });
});
