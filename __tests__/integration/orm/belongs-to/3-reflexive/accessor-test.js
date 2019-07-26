import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Belongs To | Reflexive | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ user, friend ] = this.helper[state]();

      // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
      if (friend) {
        expect(user.user.attrs).toEqual(friend.attrs);
        expect(user.userId).toEqual(friend.id);
      } else {
        expect(user.user).toEqual(null);
        expect(user.userId).toEqual(null);
      }

      // If there's a friend in this state, make sure the inverse association is correct
      if (friend) {
        expect(friend.user.attrs).toEqual(user.attrs);
        expect(friend.userId).toEqual(user.id);
      }
    });

  });
});
