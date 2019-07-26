import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Reflexive | association #create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can create an associated parent`, assert => {
      let [ user, originalUser ] = this.helper[state]();

      let ganon = user.createUser({ name: 'Ganon' });

      expect(ganon.id).toBeTruthy();
      expect(user.user.attrs).toEqual(ganon.attrs);
      expect(ganon.user.attrs).toEqual(user.attrs);
      expect(user.userId).toEqual(ganon.id);
      expect(ganon.userId).toEqual(user.id);
      expect(this.helper.schema.users.find(user.id).userId).toEqual(ganon.id);

      if (originalUser) {
        originalUser.reload();
        expect(originalUser.userId).toEqual(null);
      }
    });

  });
});
