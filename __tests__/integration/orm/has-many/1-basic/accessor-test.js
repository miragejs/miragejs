import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Has Many | Basic | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, assert => {
      let [user, posts] = this.helper[state]();

      expect(user.posts.models.length).toEqual(posts.length);
      expect(user.postIds.length).toEqual(posts.length);

      posts.forEach((post, i) => {
        expect(user.posts.models[i]).toEqual(posts[i]);

        if (post.isSaved()) {
          expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
        }
      });
    });
  });
});
