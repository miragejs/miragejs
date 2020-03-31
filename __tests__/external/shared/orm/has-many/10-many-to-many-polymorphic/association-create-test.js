import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | association #create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = helper[state]();
      let initialCount = user.commentables.models.length;

      let post = user.createCommentable("post", { title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(user.commentables.models).toHaveLength(initialCount + 1);
      expect(user.commentables.includes(post)).toBeTruthy();
      expect(
        user.commentableIds.find((obj) => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(
        user.attrs.commentableIds.find((obj) => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(post.users.includes(user)).toBeTruthy();
    });
  });
});
