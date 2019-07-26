import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive | association #new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {

    test(`a ${state} can build a new associated child`, assert => {
      let [ tag ] = this.helper[state]();
      let initialCount = tag.labels.models.length;

      let blueTag = tag.newLabel({ name: 'Blue' });

      expect(!blueTag.id).toBeTruthy();
      expect(tag.labels.models.length).toEqual(initialCount + 1);
      expect(blueTag.labels.models.length).toEqual(1);

      blueTag.save();

      expect(blueTag.attrs).toEqual({ id: blueTag.id, name: 'Blue', labelIds: [ tag.id ] });
      expect(tag.labels.models.length).toEqual(initialCount + 1);
      expect(tag.labels.includes(blueTag)).toBeTruthy();
      expect(tag.labelIds.indexOf(blueTag.id) > -1).toBeTruthy();
      expect(blueTag.labels.includes(tag)).toBeTruthy();
    });

  });
});
