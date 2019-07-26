import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Belongs To | One-Way Reflexive | association #new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {

    test(`a ${state} can build a new associated parent`, assert => {
      let [ child ] = this.helper[state]();

      let ganon = child.newUser({ name: 'Ganon' });

      expect(!ganon.id).toBeTruthy();
      expect(child.user).toEqual(ganon);
      expect(child.userId).toEqual(null);

      child.save();

      expect(ganon.id).toBeTruthy();
      expect(child.userId).toEqual(ganon.id);
    });

  });
});
