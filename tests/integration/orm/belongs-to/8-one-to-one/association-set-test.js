import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let profile = this.helper.savedParent();

    user.profile = profile;

    assert.equal(user.profileId, profile.id);
    assert.deepEqual(user.profile.attrs, profile.attrs);
    assert.equal(profile.userId, user.id, 'the inverse was set');
    assert.deepEqual(profile.user.attrs, user.attrs);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let profile = this.helper.newParent();

    user.profile = profile;

    assert.equal(user.profileId, null);
    assert.deepEqual(user.profile.attrs, profile.attrs);

    assert.equal(profile.userId, user.id, 'the inverse was set');
    assert.deepEqual(profile.user.attrs, user.attrs);
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ user ] = this.helper[state]();

    user.profile = null;

    assert.equal(user.profileId, null);
    assert.deepEqual(user.profile, null);
  });

});
