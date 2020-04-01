import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-Way Reflexive | accessor", () => {
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
      let [user, parent] = helper[state]();

      // We use .attrs here to avoid infinite recursion
      if (parent) {
        expect(user.user.attrs).toEqual(parent.attrs);
        expect(user.userId).toEqual(parent.id);
      } else {
        expect(user.user).toBeNil();
        expect(user.userId).toBeNil();
      }
    });
  });
});
