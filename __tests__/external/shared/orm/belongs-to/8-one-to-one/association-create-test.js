import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One To One | association #create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = helper[state]();

      let profile = user.createProfile({ age: 300 });

      expect(profile.id).toBeTruthy();
      expect(user.profile.attrs).toEqual(profile.attrs);
      expect(profile.user.attrs).toEqual(user.attrs);
      expect(user.profileId).toEqual(profile.id);
      expect(helper.schema.users.find(user.id).profileId).toEqual(profile.id);
    });
  });
});
