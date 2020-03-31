import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | Many To One | association #setIds", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [post, originalUser] = helper[state]();
      let user = helper.savedParent();

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

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [post, originalUser] = helper[state]();

      post.userId = null;

      expect(post.user).toBeNull();
      expect(post.userId).toBeNull();

      post.save();

      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });
  });
});
