import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One To One | association #create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can create an associated parent`, assert => {
      let [ user ] = this.helper[state]();

      let profile = user.createProfile({ age: 300 });

      expect(profile.id).toBeTruthy();
      expect(user.profile.attrs).toEqual(profile.attrs);
      expect(profile.user.attrs).toEqual(user.attrs);
      expect(user.profileId).toEqual(profile.id);
      expect(this.helper.schema.users.find(user.id).profileId).toEqual(profile.id);
    });

  });
});
