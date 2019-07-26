import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, assert => {
      let [user, posts] = this.helper[state]();

      expect(user.blogPosts.models.length).toEqual(posts.length);
      expect(user.blogPostIds.length).toEqual(posts.length);

      posts.forEach((post, i) => {
        expect(user.blogPosts.models[i]).toEqual(posts[i]);

        if (post.isSaved()) {
          expect(user.blogPostIds.indexOf(post.id) > -1).toBeTruthy();
        }
      });
    });
  });
});
