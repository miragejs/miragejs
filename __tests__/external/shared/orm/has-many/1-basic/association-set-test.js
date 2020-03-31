import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Basic | association #set", () => {
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

      user.posts = [savedPost];

      expect(user.posts.models.indexOf(savedPost) > -1).toBeTruthy();
      expect(user.postIds.indexOf(savedPost.id) > -1).toBeTruthy();
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = helper[state]();
      let newPost = helper.newChild();

      user.posts = [newPost];

      expect(user.postIds).toEqual([undefined]);
      expect(user.posts.models[0]).toEqual(newPost);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = helper[state]();

      user.posts = [];

      expect(user.postIds).toBeEmpty();
      expect(user.posts.models).toHaveLength(0);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = helper[state]();

      user.posts = null;

      expect(user.postIds).toBeEmpty();
      expect(user.posts.models).toHaveLength(0);
    });
  });
});
