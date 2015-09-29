import BelongsToHelper from './belongs-to-helper';
import {module, test} from 'qunit';

module('Integration | Schema | belongsTo #newAssociation', {
  beforeEach: function() {
    this.helper = new BelongsToHelper();
  }
});

/*
  newAssociation behavior works regardless of the state of the child
*/

[
  'savedChildNoParent',
  'savedChildNewParent',
  'savedChildSavedParent',
  'newChildNoParent',
  'newChildNewParent',
  'newChildSavedParent',
].forEach(state => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    var [address] = this.helper[state]();

    var ganon = address.newUser({name: 'Ganon'});

    assert.ok(!ganon.id, 'the parent was not persisted');
    assert.deepEqual(address.user, ganon);
    assert.equal(address.userId, null);

    address.save();

    assert.ok(ganon.id, 'saving the child persists the parent');
    assert.equal(address.userId, ganon.id, 'the childs fk was updated');
  });

});
