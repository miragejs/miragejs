import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-Way Reflexive | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The reference to a belongs-to association is correct, for all states
*/
states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ user, parent ] = this.helper[state]();

    // We use .attrs here to avoid infinite recursion
    if (parent) {
      assert.deepEqual(user.user.attrs, parent.attrs, 'the model reference is correct');
      assert.equal(user.userId, parent.id, 'the modelId reference is correct');
    } else {
      assert.deepEqual(user.user, null, 'the model reference is correct');
      assert.equal(user.userId, null, 'the modelId reference is correct');
    }
  });

});
