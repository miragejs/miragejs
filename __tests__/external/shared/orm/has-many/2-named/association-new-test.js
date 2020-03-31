import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named | association #new", () => {
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
      let initialCount = user.blogPosts.models.length;

      let post = user.newBlogPost({ title: "Lorem ipsum" });

      expect(!post.id).toBeTruthy();
      expect(user.blogPosts.models).toHaveLength(initialCount + 1);

      post.save();

      expect(post.attrs).toEqual({ id: post.id, title: "Lorem ipsum" });
      expect(user.blogPosts.models).toHaveLength(initialCount + 1);
      expect(user.blogPosts.models.filter((a) => a.id === post.id)[0]).toEqual(
        post
      );
      expect(user.blogPostIds.indexOf(post.id) > -1).toBeTruthy();
    });
  });
});
