import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named One-Way Reflexive | accessor", () => {
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
        expect(user.parent.attrs).toEqual(parent.attrs);
        expect(user.parentId).toEqual(parent.id);
      } else {
        expect(user.parent).toBeNil();
        expect(user.parentId).toBeNil();
      }
    });
  });
});
