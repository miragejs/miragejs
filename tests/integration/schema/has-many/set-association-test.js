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
    var [user, homeAddresses] = this.helper[state]();
    var savedHomeAddress = this.helper.savedChild();

    user.homeAddresses = [savedHomeAddress];
    savedHomeAddress.reload();

    assert.deepEqual(user.homeAddresses[0], savedHomeAddress);
    homeAddresses.forEach(function(address) {
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
    var savedHomeAddress = this.helper.savedChild();

    user.homeAddresses = [savedHomeAddress];
    savedHomeAddress.reload();

    assert.equal(savedHomeAddress.userId, user.id, `the child's fk was set`);
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
    var [user, homeAddresses] = this.helper[state]();
    var address = this.helper.newChild();

    user.homeAddresses = [address];
    // The address is saved if the user is a saved user. In that case, we need to reload.
    if (user.isSaved()) {
      address.reload();
    }

    assert.deepEqual(user.homeAddresses[0], address);
    homeAddresses.forEach(function(address) {
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

    user.homeAddresses = [address];
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
    var [user, homeAddresses] = this.helper[state]();
    var savedHomeAddress = this.helper.savedChild();
    var newAddress = this.helper.newChild();

    user.homeAddresses = [savedHomeAddress, newAddress];
    savedHomeAddress.reload();
    // The new address is saved if the user is a saved user. In that case, we need to reload.
    if (user.isSaved()) {
      newAddress.reload();
    }

    assert.deepEqual(user.homeAddresses[0], savedHomeAddress);
    assert.deepEqual(user.homeAddresses[1], newAddress);
    homeAddresses.forEach(function(address) {
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
    var savedHomeAddress = this.helper.savedChild();
    var newHomeAddress = this.helper.newChild();

    user.homeAddresses = [savedHomeAddress, newHomeAddress];
    savedHomeAddress.reload();
    newHomeAddress.reload();

    assert.ok(newHomeAddress.isSaved(), 'the new child was saved');
    assert.equal(savedHomeAddress.userId, user.id, `the saved child's fk was set`);
    assert.equal(newHomeAddress.userId, user.id, `the new child's fk was set`);
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
    var [user, homeAddresses] = this.helper[state]();

    user.homeAddresses = [];

    assert.equal(user.homeAddresses.length, 0);
    homeAddresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address.userId, null, 'old saved children have their fks cleared');
      }
    });
  });

});
