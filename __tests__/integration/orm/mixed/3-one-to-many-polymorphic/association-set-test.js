import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Mixed | One To Many Polymorphic | association #set', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a list of saved children`, assert => {
      let [ user, originalPosts ] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.things = [ savedPost ];

      expect(user.things.includes(savedPost)).toBeTruthy();
      expect(
        user.thingIds.find(({ id, type }) => ((id === savedPost.id && type === 'post')))
      ).toBeTruthy();

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [ user, originalPosts ] = this.helper[state]();
      let newPost = this.helper.newChild();

      user.things = [ newPost ];

      expect(user.thingIds).toEqual([ { type: 'post', id: undefined } ]);
      expect(user.things.includes(newPost)).toBeTruthy();

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [ user, originalPosts ] = this.helper[state]();

      user.things = [ ];

      expect(user.thingIds).toEqual([ ]);
      expect(user.things.models.length).toEqual(0);

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [ user, originalPosts ] = this.helper[state]();

      user.things = null;

      expect(user.thingIds).toEqual([ ]);
      expect(user.things.models.length).toEqual(0);

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

  });
});
