import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-way Polymorphic | delete", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [comment, post] = this.helper[state]();

      if (post) {
        post.destroy();
        comment.reload();
      }

      expect(comment.commentableId).toEqual(null);
      expect(comment.post).toEqual(null);
    });
  });
});
