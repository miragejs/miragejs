import BelongsToHelper from './belongs-to-helper';
import {module, test} from 'qunit';

module('Integration | Schema | belongsTo #setAssociationId', {
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

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    var [address] = this.helper[state]();
    var savedUser = this.helper.savedParent();

    address.userId = savedUser.id;

    assert.equal(address.userId, savedUser.id);
    assert.deepEqual(address.user, savedUser);
  });

});

[
  'savedChildSavedParent',
  'newChildSavedParent',
].forEach(state => {

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    var [address] = this.helper[state]();

    address.userId = null;

    assert.equal(address.userId, null);
    assert.deepEqual(address.user, null);
  });

});

