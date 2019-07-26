import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-Way Reflexive | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ tag, tags ] = this.helper[state]();

      expect(tag.tags.models.length).toEqual(tags.length);
      expect(tag.tagIds.length).toEqual(tags.length);

      tags.forEach(t => {
        expect(tag.tags.includes(t)).toBeTruthy();

        if (t.isSaved()) {
          expect(tag.tagIds.indexOf(t.id) > -1).toBeTruthy();
        }
      });
    });

  });
});
