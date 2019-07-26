import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Named | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting children updates the parent's foreign key for a ${state}`, assert => {
      let [ user, blogPosts ] = this.helper[state]();

      if (blogPosts && blogPosts.length) {
        blogPosts.forEach(p => p.destroy());
        user.reload();
      }

      expect(user.blogPosts.length).toEqual(0);
      expect(user.blogPostIds.length).toEqual(0);
    });

  });
});
