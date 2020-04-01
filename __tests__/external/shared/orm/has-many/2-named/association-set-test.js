import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named | association #set", () => {
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
      let [user] = helper[state]();
      let savedPost = helper.savedChild();

      user.blogPosts = [savedPost];

      expect(user.blogPosts.models.indexOf(savedPost) > -1).toBeTruthy();
      expect(user.blogPostIds.indexOf(savedPost.id) > -1).toBeTruthy();
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = helper[state]();
      let newPost = helper.newChild();

      user.blogPosts = [newPost];

      expect(user.blogPostIds).toEqual([undefined]);
      expect(user.blogPosts.models[0]).toEqual(newPost);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = helper[state]();

      user.blogPosts = [];

      expect(user.blogPostIds).toBeEmpty();
      expect(user.blogPosts.models).toHaveLength(0);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = helper[state]();

      user.blogPosts = null;

      expect(user.blogPostIds).toBeEmpty();
      expect(user.blogPosts.models).toHaveLength(0);
    });
  });
});
