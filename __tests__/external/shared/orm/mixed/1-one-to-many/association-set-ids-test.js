import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | One To Many | association #setIds", () => {
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
      let [user, originalPosts] = helper[state]();
      let savedPost = helper.savedChild();

      user.postIds = [savedPost.id];

      expect(user.posts.includes(savedPost)).toBeTruthy();
      expect(user.postIds).toEqual([savedPost.id]);

      user.save();
      savedPost.reload();

      // Check the inverse
      expect(savedPost.user.attrs).toEqual(user.attrs);
      expect(savedPost.userId).toEqual(user.id);

      // Check old associates
      originalPosts.forEach((post) => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toBeNull();
        }
      });
    });

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user, originalPosts] = helper[state]();

      user.postIds = null;

      expect(user.posts.models).toBeEmpty();
      expect(user.postIds).toBeEmpty();

      user.save();

      // Check old associates
      originalPosts.forEach((post) => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toBeNull();
        }
      });
    });
  });
});
