import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Reflexive | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting children updates the parent's foreign key for a ${state}`, assert => {
      let [ tag, tags ] = this.helper[state]();

      if (tags && tags.length) {
        tags.forEach(t => t.destroy());
        tag.reload();
      }

      expect(tag.tags.length).toEqual(0);
      expect(tag.tagIds.length).toEqual(0);
    });

  });
});
