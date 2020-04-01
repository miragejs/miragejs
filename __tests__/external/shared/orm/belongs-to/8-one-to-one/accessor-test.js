import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One To One | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {
    test(`the references of a ${state} are correct`, () => {
      let [user, profile] = helper[state]();

      // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
      if (profile) {
        expect(user.profile.attrs).toEqual(profile.attrs);
        expect(user.profileId).toEqual(profile.id);
      } else {
        expect(user.profile).toBeNil();
        expect(user.profileId).toBeNil();
      }

      // If there's a profile in this state, make sure the inverse association is correct
      if (profile) {
        expect(profile.user.attrs).toEqual(user.attrs);
        expect(profile.userId).toEqual(user.id);
      }
    });
  });
});
