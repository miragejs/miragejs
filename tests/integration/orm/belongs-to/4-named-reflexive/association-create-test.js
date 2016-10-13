import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named Reflexive | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a belongs-to association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated parent`, function(assert) {
    let [ user ] = this.helper[state]();

    let ganon = user.createBestFriend({ name: 'Ganon' });

    assert.ok(ganon.id, 'the parent was persisted');
    assert.deepEqual(user.bestFriend.attrs, ganon.attrs);
    assert.equal(user.bestFriendId, ganon.id);
    assert.equal(this.helper.schema.users.find(user.id).bestFriendId, ganon.id, 'the user was persisted');
  });

});
