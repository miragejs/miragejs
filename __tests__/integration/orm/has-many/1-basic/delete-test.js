import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Basic | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting children updates the parent's foreign key for a ${state}`, () => {
      let [user, posts] = helper[state]();

      if (posts && posts.length) {
        posts.forEach(p => p.destroy());
        user.reload();
      }

      expect(user.posts).toHaveLength(0);
      expect(user.postIds).toHaveLength(0);
    });
  });
});
