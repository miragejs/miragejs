import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Reflexive | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent`, function(assert) {
    let [ user, originalUser ] = this.helper[state]();
    let friend = this.helper.savedParent();

    user.user = friend;

    assert.equal(user.userId, friend.id);
    assert.deepEqual(user.user.attrs, friend.attrs);

    user.save();
    if (originalUser) {
      originalUser.reload();
      assert.equal(originalUser.userId, null, 'old inverses were cleared out');
    }
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user, originalUser ] = this.helper[state]();
    let friend = this.helper.newParent();

    user.user = friend;

    assert.equal(user.userId, null);
    assert.deepEqual(user.user.attrs, friend.attrs);

    user.save();
    if (originalUser) {
      originalUser.reload();
      assert.equal(originalUser.userId, null, 'old inverses were cleared out');
    }
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ user, originalUser ] = this.helper[state]();

    user.user = null;

    assert.equal(user.userId, null);
    assert.deepEqual(user.user, null);

    user.save();
    if (originalUser) {
      originalUser.reload();
      assert.equal(originalUser.userId, null, 'old inverses were cleared out');
    }
  });

});
