import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {
    test(`the references of a ${state} are correct`, () => {
      let [user, posts] = helper[state]();

      expect(user.blogPosts.models).toHaveLength(posts.length);
      expect(user.blogPostIds).toHaveLength(posts.length);

      posts.forEach((post, i) => {
        expect(user.blogPosts.models[i]).toEqual(posts[i]);

        if (post.isSaved()) {
          expect(user.blogPostIds.indexOf(post.id) > -1).toBeTruthy();
        }
      });
    });
  });
});
