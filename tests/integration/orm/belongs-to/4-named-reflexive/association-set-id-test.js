import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named Reflexive | association #setId', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ user ] = this.helper[state]();
    let friend = this.helper.savedParent();

    user.bestFriendId = friend.id;

    assert.equal(user.bestFriendId, friend.id);
    assert.deepEqual(user.bestFriend.attrs, friend.attrs);
  });

});

[
  'savedChildSavedParent',
  'newChildSavedParent'
].forEach((state) => {

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ user ] = this.helper[state]();

    user.bestFriendId = null;

    assert.equal(user.bestFriendId, null);
    assert.equal(user.bestFriend, null);
  });

});
