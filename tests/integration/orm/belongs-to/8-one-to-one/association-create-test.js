import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a belongs-to association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated parent`, function(assert) {
    let [ user ] = this.helper[state]();

    let profile = user.createProfile({ age: 300 });

    assert.ok(profile.id, 'the parent was persisted');
    assert.deepEqual(user.profile.attrs, profile.attrs);
    assert.deepEqual(profile.user.attrs, user.attrs, 'the inverse was set');
    assert.equal(user.profileId, profile.id);
    assert.equal(this.helper.schema.users.find(user.id).profileId, profile.id, 'the user was persisted');
  });

});
