import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Reflexive | association #set', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a list of saved children`, assert => {
      let [ tag, originalTags ] = this.helper[state]();
      let savedTag = this.helper.savedChild();

      tag.tags = [ savedTag ];

      expect(tag.tags.includes(savedTag)).toBeTruthy();
      expect(tag.tagIds[0]).toEqual(savedTag.id);
      expect(savedTag.tags.includes(tag)).toBeTruthy();

      tag.save();

      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.tags.includes(tag)).toBeFalsy();
      });
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [ tag, originalTags ] = this.helper[state]();
      let newTag = this.helper.newChild();

      tag.tags = [ newTag ];

      expect(tag.tags.includes(newTag)).toBeTruthy();
      expect(tag.tagIds[0]).toEqual(undefined);
      expect(newTag.tags.includes(tag)).toBeTruthy();

      tag.save();

      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.tags.includes(tag)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [ tag, originalTags ] = this.helper[state]();

      tag.tags = [ ];

      expect(tag.tagIds).toEqual([ ]);
      expect(tag.tags.models.length).toEqual(0);

      tag.save();
      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.tags.includes(tag)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [ tag, originalTags ] = this.helper[state]();

      tag.tags = null;

      expect(tag.tagIds).toEqual([ ]);
      expect(tag.tags.models.length).toEqual(0);

      tag.save();
      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.tags.includes(tag)).toBeFalsy();
      });
    });

  });
});
