import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, () => {
      let [user, posts] = this.helper[state]();

      expect(user.posts.models.length).toEqual(posts.length);
      expect(user.postIds.length).toEqual(posts.length);

      posts.forEach(post => {
        expect(user.posts.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
        }

        // Check the inverse
        expect(post.user.attrs).toEqual(user.attrs);
        expect(post.userId).toEqual(user.id);
      });
    });
  });
});
