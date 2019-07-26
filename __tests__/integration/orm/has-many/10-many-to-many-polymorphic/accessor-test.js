import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many-to-many Polymorphic | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, assert => {
      let [user, posts] = this.helper[state]();

      expect(user.commentables.models.length).toEqual(posts.length);
      expect(user.commentableIds.length).toEqual(posts.length);

      posts.forEach((post, i) => {
        expect(user.commentables.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(user.commentableIds[i]).toEqual({ type: "post", id: post.id });
        }

        // Check the inverse
        expect(post.users.includes(user)).toBeTruthy();
      });
    });
  });
});
