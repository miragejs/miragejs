import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named Reflexive Explicit Inverse | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting the parent updates the child's foreign key for a ${state}`, assert => {
      let [ user, bestFriend ] = this.helper[state]();

      if (bestFriend) {
        bestFriend.destroy();
        user.reload();
      }

      expect(user.bestFriendId).toEqual(null);
      expect(user.bestFriend).toEqual(null);
    });

  });
});
