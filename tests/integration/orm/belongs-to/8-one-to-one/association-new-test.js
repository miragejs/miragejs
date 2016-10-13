import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ user ] = this.helper[state]();

    let profile = user.newProfile({ age: 300 });

    assert.ok(!profile.id, 'the parent was not persisted');
    assert.deepEqual(user.profile, profile);
    assert.equal(user.profileId, null);
    assert.deepEqual(profile.user, user, 'the inverse was set');
    assert.equal(profile.userId, user.id);

    user.save();

    assert.ok(profile.id, 'saving the child persists the parent');
    assert.equal(user.profileId, profile.id, 'the childs fk was updated');
  });

});
