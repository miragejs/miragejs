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
    var [user, homeAddresses] = this.helper[state]();
    var savedHomeAddress = this.helper.savedChild();

    user.homeAddressIds = [savedHomeAddress.id];
    savedHomeAddress.reload();

    assert.deepEqual(user.homeAddresses[0], savedHomeAddress);
    homeAddresses.forEach(function(homeAddress) {
      if (homeAddress.isSaved()) {
        homeAddress.reload();
        assert.equal(homeAddress.userId, null, 'old saved children have their fks cleared');
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
    var savedHomeAddress = this.helper.savedChild();

    user.homeAddressIds = [savedHomeAddress.id];
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

  test(`a ${state} can update its associationIds to an empty list`, function(assert) {
    var [user, homeAddresses] = this.helper[state]();

    user.homeAddressIds = [];

    assert.equal(user.homeAddresses.length, 0);
    homeAddresses.forEach(function(homeAddress) {
      if (homeAddress.isSaved()) {
        homeAddress.reload();
        assert.equal(homeAddress.userId, null, 'old saved children have their fks cleared');
      }
    });
  });

});
