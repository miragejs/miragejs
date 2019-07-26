import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named | delete", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting the parent updates the child's foreign key for a ${state}`, () => {
      let [post, user] = this.helper[state]();

      if (user) {
        user.destroy();
        post.reload();
      }

      expect(post.authorId).toEqual(null);
      expect(post.author).toEqual(null);
    });
  });
});
