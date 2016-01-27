import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | Schema | hasMany #newAssociation', {
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

  test(`a ${state} can build a new associated parent`, function(assert) {
    var [user, homeAddresses] = this.helper[state]();
    var startingCount = homeAddresses.length;

    var springfield = user.newHomeAddress({name: '1 Springfield ave'});

    assert.ok(!springfield.id, 'the child was not persisted');
    assert.deepEqual(user.homeAddresses[startingCount], springfield, `the child is appended to the parent's collection`);

    if (!user.isNew()) {
      assert.equal(springfield.userId, user.id, `the new address's fk reference the saved parent`);
    }

    user.save();

    assert.ok(springfield.id, 'saving the parent persists the child');
    assert.equal(springfield.userId, user.id, 'the childs fk was updated');
    assert.equal(springfield.name, '1 Springfield ave', 'the childs attrs were saved');
  });

  test(`a ${state} can build a new associated parent without passing in attrs (regression)`, function(assert) {
    var [user, homeAddresses] = this.helper[state]();
    var startingCount = homeAddresses.length;

    var springfield = user.newHomeAddress();

    assert.deepEqual(user.homeAddresses[startingCount], springfield, `the child is appended to the parent's collection`);
  });

});
