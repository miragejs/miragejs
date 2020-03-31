import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | One To Many Polymorphic | association #setIds", () => {
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

      user.thingIds = [{ type: "post", id: savedPost.id }];

      expect(user.things.includes(savedPost)).toBeTruthy();
      expect(user.thingIds).toEqual([{ type: "post", id: savedPost.id }]);

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

      user.thingIds = null;

      expect(user.things.models).toBeEmpty();
      expect(user.thingIds).toBeEmpty();

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
