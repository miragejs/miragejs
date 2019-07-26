import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting the parent updates the child's foreign key for a ${state}`, assert => {
      let [ user, profile ] = this.helper[state]();

      if (profile) {
        profile.destroy();
        user.reload();
      }

      expect(user.profileId).toEqual(null);
      expect(user.profile).toEqual(null);
    });

  });
});
