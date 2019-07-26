import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Mixed | Many To One | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ post, user ] = this.helper[state]();

      if (post.user) {
        expect(post.user.equals(user)).toBeTruthy();
      } else {
        expect(post.user).toEqual(null);
        expect(user).toEqual(null);
      }
      expect(post.userId).toEqual(user ? user.id : null);

      post.save();

      // Check the inverse
      if (user && user.isSaved()) {
        user.reload();
        expect(user.posts.includes(post)).toBeTruthy();
      }
    });

  });
});
