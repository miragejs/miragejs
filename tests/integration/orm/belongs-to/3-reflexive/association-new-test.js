import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Reflexive | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ user, originalUser ] = this.helper[state]();

    let ganon = user.newUser({ name: 'Ganon' });

    assert.ok(!ganon.id, 'the parent was not persisted');
    assert.deepEqual(user.user, ganon);
    assert.equal(user.userId, null);
    assert.deepEqual(ganon.user, user, 'the inverse was set');

    user.save();

    assert.ok(ganon.id, 'saving the child persists the parent');
    assert.equal(user.userId, ganon.id, 'the childs fk was updated');

    if (originalUser) {
      originalUser.reload();
      assert.equal(originalUser.userId, null, 'old inverses were cleared out');
    }
  });

});
