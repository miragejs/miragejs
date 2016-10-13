import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named Reflexive | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let friend = this.helper.savedParent();

    user.bestFriend = friend;

    assert.equal(user.bestFriendId, friend.id);
    assert.deepEqual(user.bestFriend.attrs, friend.attrs);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let friend = this.helper.newParent();

    user.bestFriend = friend;

    assert.equal(user.bestFriendId, null);
    assert.deepEqual(user.bestFriend.attrs, friend.attrs);
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ user ] = this.helper[state]();

    user.bestFriend = null;

    assert.equal(user.bestFriendId, null);
    assert.deepEqual(user.bestFriend, null);
  });

});
