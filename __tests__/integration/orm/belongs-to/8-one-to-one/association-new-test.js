import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Belongs To | One To One | association #new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {

    test(`a ${state} can build a new associated parent`, assert => {
      let [ user ] = this.helper[state]();

      let profile = user.newProfile({ age: 300 });

      expect(!profile.id).toBeTruthy();
      expect(user.profile).toEqual(profile);
      expect(user.profileId).toEqual(null);
      expect(profile.user).toEqual(user);
      expect(profile.userId).toEqual(user.id);

      user.save();

      expect(profile.id).toBeTruthy();
      expect(user.profileId).toEqual(profile.id);
    });

  });
});
