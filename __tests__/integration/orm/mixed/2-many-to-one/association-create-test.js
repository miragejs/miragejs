import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Mixed | Many To One | association #create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can create an associated parent`, assert => {
      let [ post, originalUser ] = this.helper[state]();

      let user = post.createUser({ name: 'Zelda' });

      expect(user.id).toBeTruthy();
      expect(post.user.attrs).toEqual(user.attrs);
      expect(post.userId).toEqual(user.id);

      // Check the inverse
      expect(user.posts.includes(post)).toBeTruthy();

      // Ensure old inverse was cleared
      if (originalUser && originalUser.isSaved()) {
        originalUser.reload();
        expect(originalUser.posts.includes(post)).toBeFalsy();
      }
    });

  });
});
