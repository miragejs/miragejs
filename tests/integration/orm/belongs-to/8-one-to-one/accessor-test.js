import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The reference to a belongs-to association is correct, for all states
*/
states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ user, profile ] = this.helper[state]();

    // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
    if (profile) {
      assert.deepEqual(user.profile.attrs, profile.attrs, 'the model reference is correct');
      assert.equal(user.profileId, profile.id, 'the modelId reference is correct');
    } else {
      assert.deepEqual(user.profile, null, 'the model reference is correct');
      assert.equal(user.profileId, null, 'the modelId reference is correct');
    }

    // If there's a profile in this state, make sure the inverse association is correct
    if (profile) {
      assert.deepEqual(profile.user.attrs, user.attrs, 'the inverse model reference is correct');
      assert.equal(profile.userId, user.id, 'the inverse modelId reference is correct');
    }
  });

});
