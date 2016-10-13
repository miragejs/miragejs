import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-Way Reflexive | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting the parent updates the child's foreign key for a ${state}`, function(assert) {
    let [ user, targetUser ] = this.helper[state]();

    if (targetUser) {
      targetUser.destroy();
      user.reload();
    }

    assert.equal(user.userId, null);
    assert.deepEqual(user.user, null);
  });

});
