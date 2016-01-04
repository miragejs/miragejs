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
    var [user, addresses] = this.helper[state]();

    assert.equal(user.addresses.length, addresses.length, 'parent has correct number of children');
    assert.equal(user.addressIds.length, addresses.length, 'parent has correct number of child ids');

    addresses.forEach(function(address, i) {
      assert.deepEqual(user.addresses[i], addresses[i], 'each child is in parent.children array');

      if (!address.isNew()) {
        assert.ok(user.addressIds.indexOf(address.id) > -1, 'each saved child id is in parent.childrenIds array');
      }
    });
  });

});
