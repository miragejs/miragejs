import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named | association #create", () => {
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
      let initialCount = user.blogPosts.models.length;

      let post = user.createBlogPost({ title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(user.blogPosts.models).toHaveLength(initialCount + 1);
      expect(user.blogPosts.includes(post)).toBeTruthy();
      expect(user.blogPostIds.indexOf(post.id) > -1).toBeTruthy();
      expect(user.attrs.blogPostIds.indexOf(post.id) > -1).toBeTruthy();
    });
  });
});
