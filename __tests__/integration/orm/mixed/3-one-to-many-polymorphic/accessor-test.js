import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Mixed | One To Many Polymorphic | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ user, posts ] = this.helper[state]();

      expect(user.things.models.length).toEqual(posts.length);
      expect(user.thingIds.length).toEqual(posts.length);

      posts.forEach(post => {
        expect(user.things.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(user.thingIds.find(obj => {
            return (obj.id === post.id && obj.type === 'post');
          })).toBeTruthy();
        }

        // Check the inverse
        expect(post.user.attrs).toEqual(user.attrs);
        expect(post.userId).toEqual(user.id);
      });
    });

  });
});
