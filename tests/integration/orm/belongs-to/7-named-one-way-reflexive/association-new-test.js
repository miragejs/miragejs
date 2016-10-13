import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ child ] = this.helper[state]();

    let ganon = child.newParent({ name: 'Ganon' });

    assert.ok(!ganon.id, 'the parent was not persisted');
    assert.deepEqual(child.parent, ganon);
    assert.equal(child.parentId, null);

    child.save();

    assert.ok(ganon.id, 'saving the child persists the parent');
    assert.equal(child.parentId, ganon.id, 'the childs fk was updated');
  });

});
