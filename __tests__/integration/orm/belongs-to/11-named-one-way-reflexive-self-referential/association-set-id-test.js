import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named one-way reflexive self referential | association #setId', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */

  [
    'savedChildNoParent',
    'savedChildSavedParent'
  ].forEach((state) => {

    test(`a ${state} can update its association to itself via parentId`, function(assert) {
      let [ user ] = this.helper[state]();

      user.representativeId = user.id;

      assert.equal(user.representativeId, user.id);
      assert.deepEqual(user.representative.attrs, user.attrs);

      user.save();

      assert.equal(user.representativeId, user.id);
      assert.deepEqual(user.representative.attrs, user.attrs);
    });

  });

  [
    'savedChildSavedParent',
    'newChildNewParent'
  ].forEach((state) => {

    test(`a ${state} can clear its association via a null parentId`, function(assert) {
      let [ user ] = this.helper[state]();

      user.representativeId = null;

      assert.equal(user.representativeId, null);
      assert.equal(user.representative, null);

      user.save();

      assert.equal(user.representativeId, null);
      assert.equal(user.representative, null);
    });

  });
});
