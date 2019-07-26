import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | association #setId', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a saved parent via parentId`, assert => {
      let [ user ] = this.helper[state]();
      let profile = this.helper.savedParent();

      user.profileId = profile.id;

      expect(user.profileId).toEqual(profile.id);
      expect(user.profile.attrs).toEqual(profile.attrs);

      user.save();
      profile.reload();

      expect(profile.userId).toEqual(user.id);
      expect(profile.user.attrs).toEqual(user.attrs);
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
});
