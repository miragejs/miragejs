import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-to-one Polymorphic | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [comment, post] = helper[state]();

      if (post) {
        post.destroy();
        comment.reload();
      }

      expect(comment.commentableId).toBeNil();
      expect(comment.commentable).toBeNil();
    });
  });
});
