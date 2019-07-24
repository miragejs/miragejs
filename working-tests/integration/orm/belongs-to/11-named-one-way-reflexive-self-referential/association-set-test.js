import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named one-way reflexive self referential | association #set', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to itself`, function(assert) {
      let [ user ] = this.helper[state]();

      user.representative = user;

      assert.equal(user.representativeId, user.id);
      assert.deepEqual(user.representative.attrs, user.attrs);

      user.save();

      assert.equal(user.representativeId, user.id);
      assert.deepEqual(user.representative.attrs, user.attrs);
    });

    test(`a ${state} can update its association to a null parent`, function(assert) {
      let [ user ] = this.helper[state]();

      user.representative = null;

      assert.equal(user.representativeId, null);
      assert.deepEqual(user.representative, null);

      user.save();

      assert.equal(user.representativeId, null);
      assert.deepEqual(user.representative, null);
    });

  });
});
