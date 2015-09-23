import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | Schema | hasMany #setAssociationIds', {
  beforeEach: function() {
    this.helper = new HasManyHelper();
  }
});

[
  'savedParentNoChildren',
  'savedParentNewChildren',
  'savedParentSavedChildren',
  'savedParentMixedChildren',
  'newParentNoChildren',
  'newParentNewChildren',
  'newParentSavedChildren',
  'newParentMixedChildren',
].forEach(state => {

  test(`a ${state} can update its associationIds to a list of saved child ids`, function(assert) {
    var [user, addresses] = this.helper[state]();
    var savedAddress = this.helper.savedChild();

    user.addressIds = [savedAddress.id];
    savedAddress.reload();

    assert.deepEqual(user.addresses[0], savedAddress);
    addresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address.userId, null, 'old saved children have their fks cleared');
      }
    });
  });

});

[
  'savedParentNoChildren',
  'savedParentNewChildren',
  'savedParentSavedChildren',
  'savedParentMixedChildren',
].forEach(state => {

  test(`updating a ${state} associationIds to a list of saved children ids updates the child's fk`, function(assert) {
    var [user] = this.helper[state]();
    var savedAddress = this.helper.savedChild();

    user.addressIds = [savedAddress.id];
    savedAddress.reload();

    assert.equal(savedAddress.userId, user.id, `the child's fk was set`);
  });

});

[
  'savedParentNoChildren',
  'savedParentNewChildren',
  'savedParentSavedChildren',
  'savedParentMixedChildren',
  'newParentNoChildren',
  'newParentNewChildren',
  'newParentSavedChildren',
  'newParentMixedChildren',
].forEach(state => {

  test(`a ${state} can update its associationIds to an empty list`, function(assert) {
    var [user, addresses] = this.helper[state]();

    user.addressIds = [];

    assert.equal(user.addresses.length, 0);
    addresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address.userId, null, 'old saved children have their fks cleared');
      }
    });
  });

});
