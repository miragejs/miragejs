import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named one-way reflexive self referential | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, function(assert) {
      let [ user, representative ] = this.helper[state]();

      // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
      if (representative) {
        assert.deepEqual(user.representative.attrs, representative.attrs, 'the model reference is correct');
        assert.equal(user.representativeId, representative.id, 'the modelId reference is correct');
      } else {
        assert.deepEqual(user.representative, null, 'the model reference is correct');
        assert.equal(user.representativeId, null, 'the modelId reference is correct');
      }
    });

  });
});
