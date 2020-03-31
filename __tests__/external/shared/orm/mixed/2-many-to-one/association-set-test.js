import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | Many To One | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [post, originalUser] = helper[state]();
      let savedUser = helper.savedParent();

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
      let [post, originalUser] = helper[state]();
      let newUser = helper.newParent();

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
      let [post, originalUser] = helper[state]();

      post.user = null;

      expect(post.user).toBeNull();

      post.save();

      // Old inverse was cleared
      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });
  });
});
