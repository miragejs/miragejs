import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent`, function(assert) {
    let [ child ] = this.helper[state]();
    let savedParent = this.helper.savedParent();

    child.parent = savedParent;

    assert.equal(child.parentId, savedParent.id);
    assert.deepEqual(child.parent.attrs, savedParent.attrs);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ child ] = this.helper[state]();
    let newParent = this.helper.newParent();

    child.parent = newParent;

    assert.equal(child.parentId, null);
    assert.deepEqual(child.parent, newParent);
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ child ] = this.helper[state]();

    child.parent = null;

    assert.equal(child.parentId, null);
    assert.deepEqual(child.parent, null);
  });

});
