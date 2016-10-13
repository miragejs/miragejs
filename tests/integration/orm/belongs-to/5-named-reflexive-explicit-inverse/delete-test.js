import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named Reflexive Explicit Inverse | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting the parent updates the child's foreign key for a ${state}`, function(assert) {
    let [ user, bestFriend ] = this.helper[state]();

    if (bestFriend) {
      bestFriend.destroy();
      user.reload();
    }

    assert.equal(user.bestFriendId, null);
    assert.deepEqual(user.bestFriend, null);
  });

});
