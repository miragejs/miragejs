import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Basic | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [post, author] = helper[state]();

      if (author) {
        author.destroy();
        post.reload();
      }

      expect(post.authorId).toBeNull();
      expect(post.author).toBeNull();
    });
  });
});
