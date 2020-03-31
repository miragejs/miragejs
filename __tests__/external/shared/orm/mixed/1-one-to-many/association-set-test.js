import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | One To Many | association #set", () => {
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
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [user, originalPosts] = helper[state]();
      let savedPost = helper.savedChild();

      user.posts = [savedPost];

      expect(user.posts.includes(savedPost)).toBeTruthy();
      expect(user.postIds.indexOf(savedPost.id) > -1).toBeTruthy();

      user.save();

      originalPosts.forEach((post) => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toBeNull();
        }
      });
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user, originalPosts] = helper[state]();
      let newPost = helper.newChild();

      user.posts = [newPost];

      expect(user.postIds).toEqual([undefined]);
      expect(user.posts.includes(newPost)).toBeTruthy();

      user.save();

      originalPosts.forEach((post) => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toBeNull();
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user, originalPosts] = helper[state]();

      user.posts = [];

      expect(user.postIds).toBeEmpty();
      expect(user.posts.models).toHaveLength(0);

      user.save();

      originalPosts.forEach((post) => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toBeNull();
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user, originalPosts] = helper[state]();

      user.posts = null;

      expect(user.postIds).toBeEmpty();
      expect(user.posts.models).toHaveLength(0);

      user.save();

      originalPosts.forEach((post) => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toBeNull();
        }
      });
    });
  });
});
