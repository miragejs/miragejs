import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`deleting children updates the parent's foreign key for a ${state}`, () => {
      let [user, posts] = helper[state]();

      if (posts && posts.length) {
        posts.forEach((p) => p.destroy());
        user.reload();
      }

      expect(user.commentables).toHaveLength(0);
      expect(user.commentableIds).toHaveLength(0);
    });
  });
});
