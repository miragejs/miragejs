import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named | association #setIds", () => {
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
      let [user] = helper[state]();
      let savedPost = helper.savedChild();

      user.blogPostIds = [savedPost.id];

      expect(user.blogPosts.models[0].attrs).toEqual(savedPost.attrs);
      expect(user.blogPostIds).toEqual([savedPost.id]);
    });

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user] = helper[state]();

      user.blogPostIds = null;

      expect(user.blogPosts.models).toBeEmpty();
      expect(user.blogPostIds).toBeEmpty();
    });
  });
});
