import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named One-Way Reflexive | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting children updates the parent's foreign key for a ${state}`, assert => {
      let [ tag, labels ] = this.helper[state]();

      if (labels && labels.length) {
        labels.forEach(t => t.destroy());
        tag.reload();
      }

      expect(tag.labels.length).toEqual(0);
      expect(tag.labelIds.length).toEqual(0);
    });

  });
});
