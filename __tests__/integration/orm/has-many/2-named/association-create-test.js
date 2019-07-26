import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Named | association #create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can create an associated parent`, assert => {
      let [ user ] = this.helper[state]();
      let initialCount = user.blogPosts.models.length;

      let post = user.createBlogPost({ title: 'Lorem ipsum' });

      expect(post.id).toBeTruthy();
      expect(user.blogPosts.models.length).toEqual(initialCount + 1);
      expect(user.blogPosts.includes(post)).toBeTruthy();
      expect(user.blogPostIds.indexOf(post.id) > -1).toBeTruthy();
      expect(user.attrs.blogPostIds.indexOf(post.id) > -1).toBeTruthy();
    });

  });
});
