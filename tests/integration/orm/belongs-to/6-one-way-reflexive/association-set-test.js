import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-Way Reflexive | association #set', {
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

    child.user = savedParent;

    assert.equal(child.userId, savedParent.id);
    assert.deepEqual(child.user.attrs, savedParent.attrs);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ child ] = this.helper[state]();
    let newParent = this.helper.newParent();

    child.user = newParent;

    assert.equal(child.userId, null);
    assert.deepEqual(child.user, newParent);
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ child ] = this.helper[state]();

    child.user = null;

    assert.equal(child.userId, null);
    assert.deepEqual(child.user, null);
  });

});
