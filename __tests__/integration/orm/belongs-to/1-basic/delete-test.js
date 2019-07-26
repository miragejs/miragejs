import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Basic | delete", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [post, author] = this.helper[state]();

      if (author) {
        author.destroy();
        post.reload();
      }

      expect(post.authorId).toEqual(null);
      expect(post.author).toEqual(null);
    });
  });
});
