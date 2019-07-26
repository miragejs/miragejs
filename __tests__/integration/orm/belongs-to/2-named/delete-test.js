import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [post, user] = helper[state]();

      if (user) {
        user.destroy();
        post.reload();
      }

      expect(post.authorId).toBeNil();
      expect(post.author).toBeNil();
    });
  });
});
