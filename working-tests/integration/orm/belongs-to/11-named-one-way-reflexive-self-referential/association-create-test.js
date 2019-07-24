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

    test(`a ${state} can create an associated parent`, function(assert) {
      let [ user ] = this.helper[state]();

      let ganon = user.createRepresentative({ name: 'Ganon' });

      assert.ok(ganon.id, 'the parent was persisted');
      assert.deepEqual(user.representative.attrs, ganon.attrs);
      assert.equal(user.representativeId, ganon.id);
      assert.equal(this.helper.schema.users.find(user.id).representativeId, ganon.id, 'the user was persisted');
    });

  });
});
