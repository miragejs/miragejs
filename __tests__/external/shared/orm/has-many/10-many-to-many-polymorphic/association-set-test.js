import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | association #set", () => {
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

      user.commentables = [savedPost];

      expect(user.commentables.models.includes(savedPost)).toBeTruthy();
      expect(
        user.commentableIds.find(
          ({ id, type }) => id === savedPost.id && type === "post"
        )
      ).toBeTruthy();
      expect(savedPost.users.includes(user)).toBeTruthy();

      user.save();

      originalPosts.forEach((post) => {
        post.reload();
        expect(post.users.includes(user)).toBeFalsy();
      });
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user, originalPosts] = helper[state]();
      let newPost = helper.newChild();

      user.commentables = [newPost];

      expect(user.commentableIds).toEqual([{ type: "post", id: undefined }]);
      expect(user.commentables.models[0]).toEqual(newPost);
      expect(newPost.users.includes(user)).toBeTruthy();

      user.save();

      originalPosts.forEach((post) => {
        post.reload();
        expect(post.users.includes(user)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user, originalPosts] = helper[state]();

      user.commentables = [];

      expect(user.commentableIds).toBeEmpty();
      expect(user.commentables.models).toHaveLength(0);

      user.save();

      originalPosts.forEach((post) => {
        post.reload();
        expect(post.users.includes(user)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via null`, () => {
      let [user, originalPosts] = helper[state]();

      user.commentables = null;

      expect(user.commentableIds).toBeEmpty();
      expect(user.commentables.models).toHaveLength(0);

      user.save();

      originalPosts.forEach((post) => {
        post.reload();
        expect(post.users.includes(user)).toBeFalsy();
      });
    });
  });
});
