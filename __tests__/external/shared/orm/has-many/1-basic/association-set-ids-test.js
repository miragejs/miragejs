import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Basic | association #setIds", () => {
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

      user.postIds = [savedPost.id];

      expect(user.posts.models[0].attrs).toEqual(savedPost.attrs);
      expect(user.postIds).toEqual([savedPost.id]);
    });

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user] = helper[state]();

      user.postIds = null;

      expect(user.posts.models).toBeEmpty();
      expect(user.postIds).toBeEmpty();
    });
  });
});
