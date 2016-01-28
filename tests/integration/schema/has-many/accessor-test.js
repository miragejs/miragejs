import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | Schema | hasMany #accessor', {
  beforeEach: function() {
    this.helper = new HasManyHelper();
  }
});

/*
  #association behavior works regardless of the state of the parent
*/

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

  test(`the references of a ${state} are correct`, function(assert) {
    var [user, homeAddresses] = this.helper[state]();

    assert.equal(user.homeAddresses.length, homeAddresses.length, 'parent has correct number of children');
    assert.equal(user.homeAddressIds.length, homeAddresses.length, 'parent has correct number of child ids');

    homeAddresses.forEach(function(homeAddress, i) {
      assert.deepEqual(user.homeAddresses[i], homeAddresses[i], 'each child is in parent.children array');

      if (!homeAddress.isNew()) {
        assert.ok(user.homeAddressIds.indexOf(homeAddress.id) > -1, 'each saved child id is in parent.childrenIds array');
      }
    });
  });

});
