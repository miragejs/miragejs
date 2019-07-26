import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | association #create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can create an associated parent`, assert => {
      let [ child ] = this.helper[state]();

      let ganon = child.createParent({ name: 'Ganon' });

      expect(ganon.id).toBeTruthy();
      expect(child.parent.attrs).toEqual(ganon.attrs);
      expect(child.parentId).toEqual(ganon.id);
      expect(this.helper.schema.users.find(child.id).parentId).toEqual(ganon.id);
    });

  });
});
