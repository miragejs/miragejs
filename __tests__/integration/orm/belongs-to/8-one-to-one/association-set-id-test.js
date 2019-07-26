import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One To One | association #setId", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [user] = this.helper[state]();
      let profile = this.helper.savedParent();

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
