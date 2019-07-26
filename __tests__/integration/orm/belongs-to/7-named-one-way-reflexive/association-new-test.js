import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | association #new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {

    test(`a ${state} can build a new associated parent`, assert => {
      let [ child ] = this.helper[state]();

      let ganon = child.newParent({ name: 'Ganon' });

      expect(!ganon.id).toBeTruthy();
      expect(child.parent).toEqual(ganon);
      expect(child.parentId).toEqual(null);

      child.save();

      expect(ganon.id).toBeTruthy();
      expect(child.parentId).toEqual(ganon.id);
    });

  });
});
