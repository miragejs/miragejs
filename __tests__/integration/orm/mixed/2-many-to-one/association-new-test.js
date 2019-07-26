import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | Many To One | association #new", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, () => {
      let [post, originalUser] = this.helper[state]();

      let user = post.newUser({ name: "Zelda" });

      expect(!user.id).toBeTruthy();
      expect(post.user).toEqual(user);
      expect(user.posts.includes(post)).toBeTruthy();

      user.save();
      post.reload();

      expect(user.id).toBeTruthy();
      expect(post.user.attrs).toEqual(user.attrs);
      expect(post.userId).toEqual(user.id);

      // Check the inverse
      expect(user.posts.includes(post)).toBeTruthy();

      // Ensure old inverse was cleared
      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });
  });
});
