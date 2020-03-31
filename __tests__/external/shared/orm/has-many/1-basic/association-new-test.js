import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Basic | association #new", () => {
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
      let initialCount = user.posts.models.length;

      let post = user.newPost({ title: "Lorem ipsum" });

      expect(!post.id).toBeTruthy();
      expect(user.posts.models).toHaveLength(initialCount + 1);

      post.save();

      expect(post.attrs).toEqual({ id: post.id, title: "Lorem ipsum" });
      expect(user.posts.models).toHaveLength(initialCount + 1);
      expect(user.posts.models.filter((a) => a.id === post.id)[0]).toEqual(
        post
      );
      expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
    });
  });
});
