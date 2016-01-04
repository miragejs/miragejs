import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | Schema | hasMany #setAssociation', {
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

  test(`a ${state} can update its association to a list of saved children`, function(assert) {
    var [user, addresses] = this.helper[state]();
    var savedAddress = this.helper.savedChild();

    user.addresses = [savedAddress];
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

  test(`updating a ${state} association to a list of saved children updates the child's fk`, function(assert) {
    var [user] = this.helper[state]();
    var savedAddress = this.helper.savedChild();

    user.addresses = [savedAddress];
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

  test(`a ${state} can update its association to a list of new children`, function(assert) {
    var [user, addresses] = this.helper[state]();
    var address = this.helper.newChild();

    user.addresses = [address];
    // The address is saved if the user is a saved user. In that case, we need to reload.
    if (user.isSaved()) {
      address.reload();
    }

    assert.deepEqual(user.addresses[0], address);
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

  test(`updating a ${state} association to a list of new children saves the children and updates their fks`, function(assert) {
    var [user] = this.helper[state]();
    var address = this.helper.newChild();

    user.addresses = [address];
    address.reload();

    assert.ok(address.isSaved(), 'the new child was saved');
    assert.equal(address.userId, user.id, `the child's fk was set`);
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

  test(`a ${state} can update its association to a list of mixed children`, function(assert) {
    var [user, addresses] = this.helper[state]();
    var savedAddress = this.helper.savedChild();
    var newAddress = this.helper.newChild();

    user.addresses = [savedAddress, newAddress];
    savedAddress.reload();
    // The new address is saved if the user is a saved user. In that case, we need to reload.
    if (user.isSaved()) {
      newAddress.reload();
    }

    assert.deepEqual(user.addresses[0], savedAddress);
    assert.deepEqual(user.addresses[1], newAddress);
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

  test(`updating a ${state} association to a list of mixed children saves the new children and updates all children's fks`, function(assert) {
    var [user] = this.helper[state]();
    var savedAddress = this.helper.savedChild();
    var newAddress = this.helper.newChild();

    user.addresses = [savedAddress, newAddress];
    savedAddress.reload();
    newAddress.reload();

    assert.ok(newAddress.isSaved(), 'the new child was saved');
    assert.equal(savedAddress.userId, user.id, `the saved child's fk was set`);
    assert.equal(newAddress.userId, user.id, `the new child's fk was set`);
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

  test(`a ${state} can update its association to an empty list`, function(assert) {
    var [user, addresses] = this.helper[state]();

    user.addresses = [];

    assert.equal(user.addresses.length, 0);
    addresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address.userId, null, 'old saved children have their fks cleared');
      }
    });
  });

});
