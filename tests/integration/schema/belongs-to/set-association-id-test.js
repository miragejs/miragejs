import BelongsToHelper from './belongs-to-helper';
import {module, test} from 'qunit';

module('mirage:integration:schema:belongsTo#setAssociationId', {
  beforeEach: function() {
    this.helper = new BelongsToHelper();
  }
});

[
  'savedChildNoParent',
  'savedChildNewParent',
  'savedChildSavedParent',
  'newChildNoParent',
  'newChildNewParent',
  'newChildSavedParent',
].forEach(state => {

  test(`a ${state} can update its association to a saved parent via parent_id`, function(assert) {
    var [address] = this.helper[state]();
    var savedUser = this.helper.savedParent();

    address.user_id = savedUser.id;

    assert.equal(address.user_id, savedUser.id);
    assert.deepEqual(address.user, savedUser);
  });

});

[
  'savedChildSavedParent',
  'newChildSavedParent',
].forEach(state => {

  test(`a ${state} can clear its association via a null parent_id`, function(assert) {
    var [address] = this.helper[state]();

    address.user_id = null;

    assert.equal(address.user_id, null);
    assert.deepEqual(address.user, null);
  });

});

