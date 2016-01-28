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

    var springfield = user.createHomeAddress({name: '1 Springfield ave'});

    assert.ok(springfield.id, 'the child was persisted');
    assert.equal(springfield.userId, 1, 'the fk is set');
    assert.equal(user.homeAddresses.length, startingCount + 1, 'the collection length is correct');
    assert.deepEqual(user.homeAddresses.filter(a => a.id === springfield.id)[0], springfield, 'the homeAddress was added to user.homeAddresses');
    assert.ok(user.homeAddressIds.indexOf(springfield.id) > -1, 'the id was added to the fks array');
  });

  test(`a ${state} can create an associated child without passing attrs (regression)`, function(assert) {
    var [user] = this.helper[state]();

    var springfield = user.createHomeAddress();

    assert.deepEqual(user.homeAddresses.filter(a => a.id === springfield.id)[0], springfield, 'the homeAddress was added to user.homeAddresses');
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
      user.createHomeAddress({name: '1 Springfield ave'});
    }, /unless the parent is saved/);
  });

});
