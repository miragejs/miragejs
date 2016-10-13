import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | association #setId', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ user ] = this.helper[state]();
    let profile = this.helper.savedParent();

    user.profileId = profile.id;

    assert.equal(user.profileId, profile.id);
    assert.deepEqual(user.profile.attrs, profile.attrs);

    user.save();
    profile.reload();

    assert.equal(profile.userId, user.id, 'the inverse was set');
    assert.deepEqual(profile.user.attrs, user.attrs);
  });

});

// [
//   'savedChildSavedParent',
//   'newChildSavedParent'
// ].forEach((state) => {
//
//   test(`a ${state} can clear its association via a null parentId`, function(assert) {
//     let [ user ] = this.helper[state]();
//
//     user.userId = null;
//
//     assert.equal(user.userId, null);
//     assert.equal(user.user, null);
//   });
//
// });
