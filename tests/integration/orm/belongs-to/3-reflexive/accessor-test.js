import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Reflexive | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The reference to a belongs-to association is correct, for all states
*/
states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ user, friend ] = this.helper[state]();

    // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
    if (friend) {
      assert.deepEqual(user.user.attrs, friend.attrs, 'the model reference is correct');
      assert.equal(user.userId, friend.id, 'the modelId reference is correct');
    } else {
      assert.deepEqual(user.user, null, 'the model reference is correct');
      assert.equal(user.userId, null, 'the modelId reference is correct');
    }

    // If there's a friend in this state, make sure the inverse association is correct
    if (friend) {
      assert.deepEqual(friend.user.attrs, user.attrs, 'the inverse model reference is correct');
      assert.equal(friend.userId, user.id, 'the inverse modelId reference is correct');
    }
  });

});
