import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | Many To One | association #setIds", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, assert => {
      let [post, originalUser] = this.helper[state]();
      let user = this.helper.savedParent();

      post.userId = user.id;

      expect(post.userId).toEqual(user.id);
      expect(post.user.attrs).toEqual(user.attrs);

      expect(post.user.posts.includes(post)).toBeTruthy();

      post.save();
      user.reload();

      expect(user.posts.includes(post)).toBeTruthy();

      // Old inverses were cleared
      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });

    test(`a ${state} can clear its association via a null parentId`, assert => {
      let [post, originalUser] = this.helper[state]();

      post.userId = null;

      expect(post.user).toEqual(null);
      expect(post.userId).toEqual(null);

      post.save();

      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });
  });
});
