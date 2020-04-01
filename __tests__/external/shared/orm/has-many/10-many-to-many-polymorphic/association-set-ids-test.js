import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | association #setIds", () => {
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

      user.commentableIds = [{ type: "post", id: savedPost.id }];

      expect(user.commentables.includes(savedPost)).toBeTruthy();
      expect(
        user.commentableIds.find(
          ({ id, type }) => id === savedPost.id && type === "post"
        )
      ).toBeTruthy();

      user.save();
      savedPost.reload();

      expect(savedPost.users.includes(user)).toBeTruthy();
      originalPosts.forEach((post) => {
        if (post.isSaved()) {
          post.reload();
          expect(post.users.includes(user)).toBeFalsy();
        }
      });
    });

    test(`a ${state} can clear its association via a null ids`, () => {
      let [user, originalPosts] = helper[state]();

      user.commentableIds = null;

      expect(user.commentables.models).toBeEmpty();
      expect(user.commentableIds).toBeEmpty();

      user.save();

      originalPosts.forEach((post) => {
        post.reload();
        expect(post.users.includes(user)).toBeFalsy();
      });
    });
  });
});
