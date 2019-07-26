import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ user, profile ] = this.helper[state]();

      // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
      if (profile) {
        expect(user.profile.attrs).toEqual(profile.attrs);
        expect(user.profileId).toEqual(profile.id);
      } else {
        expect(user.profile).toEqual(null);
        expect(user.profileId).toEqual(null);
      }

      // If there's a profile in this state, make sure the inverse association is correct
      if (profile) {
        expect(profile.user.attrs).toEqual(user.attrs);
        expect(profile.userId).toEqual(user.id);
      }
    });

  });
});
