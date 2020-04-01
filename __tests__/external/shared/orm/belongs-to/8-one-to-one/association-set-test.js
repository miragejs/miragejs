import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One To One | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [user] = helper[state]();
      let profile = helper.savedParent();

      user.profile = profile;

      expect(user.profileId).toEqual(profile.id);
      expect(user.profile.attrs).toEqual(profile.attrs);
      expect(profile.userId).toEqual(user.id);
      expect(profile.user.attrs).toEqual(user.attrs);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = helper[state]();
      let profile = helper.newParent();

      user.profile = profile;

      expect(user.profileId).toBeNil();
      expect(user.profile.attrs).toEqual(profile.attrs);

      expect(profile.userId).toEqual(user.id);
      expect(profile.user.attrs).toEqual(user.attrs);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [user] = helper[state]();

      user.profile = null;

      expect(user.profileId).toBeNil();
      expect(user.profile).toBeNil();
    });
  });
});
