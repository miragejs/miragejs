import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Belongs To | One To One | association #set', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a saved parent`, assert => {
      let [ user ] = this.helper[state]();
      let profile = this.helper.savedParent();

      user.profile = profile;

      expect(user.profileId).toEqual(profile.id);
      expect(user.profile.attrs).toEqual(profile.attrs);
      expect(profile.userId).toEqual(user.id);
      expect(profile.user.attrs).toEqual(user.attrs);
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [ user ] = this.helper[state]();
      let profile = this.helper.newParent();

      user.profile = profile;

      expect(user.profileId).toEqual(null);
      expect(user.profile.attrs).toEqual(profile.attrs);

      expect(profile.userId).toEqual(user.id);
      expect(profile.user.attrs).toEqual(user.attrs);
    });

    test(`a ${state} can update its association to a null parent`, assert => {
      let [ user ] = this.helper[state]();

      user.profile = null;

      expect(user.profileId).toEqual(null);
      expect(user.profile).toEqual(null);
    });

  });
});
