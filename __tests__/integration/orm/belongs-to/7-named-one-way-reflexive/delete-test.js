import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting the parent updates the child's foreign key for a ${state}`, assert => {
      let [ user, parent ] = this.helper[state]();

      if (parent) {
        parent.destroy();
        user.reload();
      }

      expect(user.parentId).toEqual(null);
      expect(user.parent).toEqual(null);
    });

  });
});
