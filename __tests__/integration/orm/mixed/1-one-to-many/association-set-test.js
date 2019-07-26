import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many | association #set", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [user, originalPosts] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.posts = [savedPost];

      expect(user.posts.includes(savedPost)).toBeTruthy();
      expect(user.postIds.indexOf(savedPost.id) > -1).toBeTruthy();

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user, originalPosts] = this.helper[state]();
      let newPost = this.helper.newChild();

      user.posts = [newPost];

      expect(user.postIds).toEqual([undefined]);
      expect(user.posts.includes(newPost)).toBeTruthy();

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user, originalPosts] = this.helper[state]();

      user.posts = [];

      expect(user.postIds).toEqual([]);
      expect(user.posts.models.length).toEqual(0);

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user, originalPosts] = this.helper[state]();

      user.posts = null;

      expect(user.postIds).toEqual([]);
      expect(user.posts.models.length).toEqual(0);

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });
  });
});
