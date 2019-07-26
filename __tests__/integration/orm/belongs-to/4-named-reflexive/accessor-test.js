import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Belongs To | Named Reflexive | accessor', function(hooks) {
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
        expect(user.bestFriend.attrs).toEqual(friend.attrs);
        expect(user.bestFriendId).toEqual(friend.id);
      } else {
        expect(user.bestFriend).toEqual(null);
        expect(user.bestFriendId).toEqual(null);
      }

      // If there's a friend in this state, make sure the inverse association is correct
      if (friend) {
        expect(friend.bestFriend.attrs).toEqual(user.attrs);
        expect(friend.bestFriendId).toEqual(user.id);
      }
    });

  });
});
