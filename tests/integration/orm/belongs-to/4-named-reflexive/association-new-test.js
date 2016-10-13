import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named Reflexive | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ user ] = this.helper[state]();

    let ganon = user.newBestFriend({ name: 'Ganon' });

    assert.ok(!ganon.id, 'the parent was not persisted');
    assert.deepEqual(user.bestFriend, ganon);
    assert.equal(user.bestFriendId, null);

    user.save();

    assert.ok(ganon.id, 'saving the child persists the parent');
    assert.equal(user.bestFriendId, ganon.id, 'the childs fk was updated');
  });

});
