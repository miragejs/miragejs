import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting the parent updates the child's foreign key for a ${state}`, function(assert) {
    let [ user, parent ] = this.helper[state]();

    if (parent) {
      parent.destroy();
      user.reload();
    }

    assert.equal(user.parentId, null);
    assert.deepEqual(user.parent, null);
  });

});
