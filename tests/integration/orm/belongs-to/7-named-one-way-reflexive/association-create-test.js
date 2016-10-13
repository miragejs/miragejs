import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a belongs-to association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated parent`, function(assert) {
    let [ child ] = this.helper[state]();

    let ganon = child.createParent({ name: 'Ganon' });

    assert.ok(ganon.id, 'the parent was persisted');
    assert.deepEqual(child.parent.attrs, ganon.attrs);
    assert.equal(child.parentId, ganon.id);
    assert.equal(this.helper.schema.users.find(child.id).parentId, ganon.id, 'the child was persisted');
  });

});
