import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | Schema | hasMany #createAssociation', {
  beforeEach: function() {
    this.helper = new HasManyHelper();
  }
});

[
  'savedParentNoChildren',
  'savedParentNewChildren',
  'savedParentSavedChildren',
  'savedParentMixedChildren',
].forEach(state => {

  test(`a ${state} can create an associated child`, function(assert) {
    var [user, children] = this.helper[state]();
    var startingCount = children.length;

    var springfield = user.createAddress({name: '1 Springfield ave'});

    assert.ok(springfield.id, 'the child was persisted');
    assert.equal(springfield.userId, 1, 'the fk is set');
    assert.equal(user.addresses.length, startingCount + 1, 'the collection length is correct');
    assert.deepEqual(user.addresses.filter(a => a.id === springfield.id)[0], springfield, 'the address was added to user.addresses');
    assert.ok(user.addressIds.indexOf(springfield.id) > -1, 'the id was added to the fks array');
  });

});

[
  'newParentNoChildren',
  'newParentNewChildren',
  'newParentSavedChildren',
  'newParentMixedChildren',
].forEach(state => {

  test(`a ${state} cannot create an associated child`, function(assert) {
    var [user] = this.helper[state]();

    assert.throws(function() {
      user.createAddress({name: '1 Springfield ave'});
    }, /unless the parent is saved/);
  });

});
