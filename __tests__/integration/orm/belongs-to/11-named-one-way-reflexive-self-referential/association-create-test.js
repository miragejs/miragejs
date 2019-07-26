import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named one-way reflexive self referential | association #create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can create an associated parent`, assert => {
      let [ user ] = this.helper[state]();

      let ganon = user.createRepresentative({ name: 'Ganon' });

      expect(ganon.id).toBeTruthy();
      expect(user.representative.attrs).toEqual(ganon.attrs);
      expect(user.representativeId).toEqual(ganon.id);
      expect(this.helper.schema.users.find(user.id).representativeId).toEqual(ganon.id);
    });

  });
});
