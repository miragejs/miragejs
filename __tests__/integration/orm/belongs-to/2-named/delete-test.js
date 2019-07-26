import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting the parent updates the child's foreign key for a ${state}`, assert => {
      let [ post, user ] = this.helper[state]();

      if (user) {
        user.destroy();
        post.reload();
      }

      expect(post.authorId).toEqual(null);
      expect(post.author).toEqual(null);
    });

  });
});
