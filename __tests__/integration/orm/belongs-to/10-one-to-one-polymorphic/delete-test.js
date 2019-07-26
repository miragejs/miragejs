import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-to-one Polymorphic | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [comment, post] = helper[state]();

      if (post) {
        post.destroy();
        comment.reload();
      }

      expect(comment.commentableId).toEqual(null);
      expect(comment.commentable).toEqual(null);
    });
  });
});
