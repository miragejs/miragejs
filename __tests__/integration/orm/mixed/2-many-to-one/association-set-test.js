import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | Many To One | association #set", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [post, originalUser] = this.helper[state]();
      let savedUser = this.helper.savedParent();

      post.user = savedUser;

      expect(post.user).toEqual(savedUser);
      expect(savedUser.posts.includes(post)).toBeTruthy();

      post.save();

      // Old inverse was cleared
      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [post, originalUser] = this.helper[state]();
      let newUser = this.helper.newParent();

      post.user = newUser;

      expect(post.user).toEqual(newUser);
      expect(newUser.posts.includes(post)).toBeTruthy();

      post.save();

      // Old inverse was cleared
      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [post, originalUser] = this.helper[state]();

      post.user = null;

      expect(post.user).toEqual(null);

      post.save();

      // Old inverse was cleared
      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });
  });
});
