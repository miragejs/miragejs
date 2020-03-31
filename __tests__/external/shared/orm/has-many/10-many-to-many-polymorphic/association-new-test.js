import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | association #new", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {
    test(`a ${state} can build a new associated parent`, () => {
      let [user] = helper[state]();
      let initialCount = user.commentables.models.length;

      let post = user.newCommentable("post", { title: "Lorem ipsum" });

      expect(!post.id).toBeTruthy();
      expect(user.commentables.models).toHaveLength(initialCount + 1);
      expect(post.users.models).toHaveLength(1);

      post.save();

      expect(post.attrs).toEqual({
        id: post.id,
        title: "Lorem ipsum",
        userIds: [user.id],
      });
      expect(user.commentables.models).toHaveLength(initialCount + 1);
      expect(user.commentables.includes(post)).toBeTruthy();
      expect(
        user.commentableIds.find((obj) => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(post.users.includes(user)).toBeTruthy();
    });
  });
});
