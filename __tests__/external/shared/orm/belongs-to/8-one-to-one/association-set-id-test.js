import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One To One | association #setId", () => {
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
      let [user] = helper[state]();
      let profile = helper.savedParent();

      user.profileId = profile.id;

      expect(user.profileId).toEqual(profile.id);
      expect(user.profile.attrs).toEqual(profile.attrs);

      user.save();
      profile.reload();

      expect(profile.userId).toEqual(user.id);
      expect(profile.user.attrs).toEqual(user.attrs);
    });
  });
});
