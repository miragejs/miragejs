import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Reflexive | association #setId', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ user, originalUser ] = this.helper[state]();
    let friend = this.helper.savedParent();

    user.userId = friend.id;

    assert.equal(user.userId, friend.id);
    assert.deepEqual(user.user.attrs, friend.attrs);

    user.save();
    if (originalUser) {
      originalUser.reload();
      assert.equal(originalUser.userId, null, 'old inverses were cleared out');
    }
  });

});

[
  'savedChildSavedParent',
  'newChildSavedParent'
].forEach((state) => {

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ user, originalUser ] = this.helper[state]();

    user.userId = null;

    assert.equal(user.userId, null);
    assert.equal(user.user, null);

    user.save();
    if (originalUser) {
      originalUser.reload();
      assert.equal(originalUser.userId, null, 'old inverses were cleared out');
    }
  });

});
