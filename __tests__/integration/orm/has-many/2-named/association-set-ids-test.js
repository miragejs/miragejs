import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Named | association #setIds', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a saved parent via parentId`, assert => {
      let [ user ] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.blogPostIds = [ savedPost.id ];

      expect(user.blogPosts.models[0].attrs).toEqual(savedPost.attrs);
      expect(user.blogPostIds).toEqual([ savedPost.id ]);
    });

    test(`a ${state} can clear its association via a null parentId`, assert => {
      let [ user ] = this.helper[state]();

      user.blogPostIds = null;

      expect(user.blogPosts.models).toEqual([]);
      expect(user.blogPostIds).toEqual([]);
    });

  });
});
