import BelongsToHelper from './belongs-to-helper';
import {module, test} from 'qunit';

module('Integration | Schema | belongsTo #setAssociation', {
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

  test(`a ${state} can update its association to a saved parent`, function(assert) {
    var [address] = this.helper[state]();
    var savedUser = this.helper.savedParent();

    address.user = savedUser;

    assert.equal(address.userId, savedUser.id);
    assert.deepEqual(address.user, savedUser);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    var [address] = this.helper[state]();
    var newUser = this.helper.newParent();

    address.user = newUser;

    assert.equal(address.userId, null);
    assert.deepEqual(address.user, newUser);
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    var [address] = this.helper[state]();

    address.user = null;

    assert.equal(address.userId, null);
    assert.deepEqual(address.user, null);
  });

});
