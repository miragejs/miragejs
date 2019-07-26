import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Named | association #set', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a list of saved children`, assert => {
      let [ user ] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.blogPosts = [ savedPost ];

      expect(user.blogPosts.models.indexOf(savedPost) > -1).toBeTruthy();
      expect(user.blogPostIds.indexOf(savedPost.id) > -1).toBeTruthy();
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [ user ] = this.helper[state]();
      let newPost = this.helper.newChild();

      user.blogPosts = [ newPost ];

      expect(user.blogPostIds).toEqual([ undefined ]);
      expect(user.blogPosts.models[0]).toEqual(newPost);
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [ user ] = this.helper[state]();

      user.blogPosts = [ ];

      expect(user.blogPostIds).toEqual([ ]);
      expect(user.blogPosts.models.length).toEqual(0);
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [ user ] = this.helper[state]();

      user.blogPosts = null;

      expect(user.blogPostIds).toEqual([ ]);
      expect(user.blogPosts.models.length).toEqual(0);
    });

  });
});
