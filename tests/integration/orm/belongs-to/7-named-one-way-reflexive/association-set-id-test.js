import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | association #setId', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ child ] = this.helper[state]();
    let savedParent = this.helper.savedParent();

    child.parentId = savedParent.id;

    assert.equal(child.parentId, savedParent.id);
    assert.deepEqual(child.parent.attrs, savedParent.attrs);
  });

});

[
  'savedChildSavedParent',
  'newChildSavedParent'
].forEach((state) => {

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ child ] = this.helper[state]();

    child.parentId = null;

    assert.equal(child.parentId, null);
    assert.deepEqual(child.parent, null);
  });

});
