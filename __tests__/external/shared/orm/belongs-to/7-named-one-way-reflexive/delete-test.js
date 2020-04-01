import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named One-Way Reflexive | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [user, parent] = helper[state]();

      if (parent) {
        parent.destroy();
        user.reload();
      }

      expect(user.parentId).toBeNil();
      expect(user.parent).toBeNil();
    });
  });
});
