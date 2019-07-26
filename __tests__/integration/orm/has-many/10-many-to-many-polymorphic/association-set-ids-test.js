import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Many-to-many Polymorphic | association #setIds', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a saved parent via parentId`, assert => {
      let [ user, originalPosts ] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.commentableIds = [ { type: 'post', id: savedPost.id } ];

      expect(user.commentables.includes(savedPost)).toBeTruthy();
      expect(
        user.commentableIds.find(({ id, type }) => ((id === savedPost.id && type === 'post')))
      ).toBeTruthy();

      user.save();
      savedPost.reload();

      expect(savedPost.users.includes(user)).toBeTruthy();
      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.users.includes(user)).toBeFalsy();
        }
      });
    });

    test(`a ${state} can clear its association via a null ids`, assert => {
      let [ user, originalPosts ] = this.helper[state]();

      user.commentableIds = null;

      expect(user.commentables.models).toEqual([]);
      expect(user.commentableIds).toEqual([]);

      user.save();

      originalPosts.forEach(post => {
        post.reload();
        expect(post.users.includes(user)).toBeFalsy();
      });
    });

  });
});
