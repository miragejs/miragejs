import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Reflexive | accessor", () => {
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
      let [user, friend] = helper[state]();

      // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
      if (friend) {
        expect(user.user.attrs).toEqual(friend.attrs);
        expect(user.userId).toEqual(friend.id);
      } else {
        expect(user.user).toBeNil();
        expect(user.userId).toBeNil();
      }

      // If there's a friend in this state, make sure the inverse association is correct
      if (friend) {
        expect(friend.user.attrs).toEqual(user.attrs);
        expect(friend.userId).toEqual(user.id);
      }
    });
  });
});
