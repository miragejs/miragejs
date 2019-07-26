import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Basic | association #new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {

    test(`a ${state} can build a new associated parent`, assert => {
      let [ user ] = this.helper[state]();
      let initialCount = user.posts.models.length;

      let post = user.newPost({ title: 'Lorem ipsum' });

      expect(!post.id).toBeTruthy();
      expect(user.posts.models.length).toEqual(initialCount + 1);

      post.save();

      expect(post.attrs).toEqual({ id: post.id, title: 'Lorem ipsum' });
      expect(user.posts.models.length).toEqual(initialCount + 1);
      expect(user.posts.models.filter((a) => a.id === post.id)[0]).toEqual(post);
      expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
    });

  });
});
