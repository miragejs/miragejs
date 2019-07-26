import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Has Many | Named Reflexive Explicit Inverse | association #setIds", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`a ${state} can update its association to include a saved child via childIds`, assert => {
      let [tag, originalTags] = this.helper[state]();
      let savedTag = this.helper.savedChild();

      tag.labelIds = [savedTag.id];

      expect(tag.labels.models[0].attrs).toEqual(savedTag.attrs);
      expect(tag.labelIds).toEqual([savedTag.id]);

      tag.save();
      savedTag.reload();

      expect(savedTag.labels.models[0].attrs).toEqual(tag.attrs);
      originalTags.forEach(originalTag => {
        if (originalTag.isSaved()) {
          originalTag.reload();
          expect(originalTag.labels.includes(tag)).toBeFalsy();
        }
      });
    });

    test(`a ${state} can clear its association via a null childIds`, assert => {
      let [tag, originalTags] = this.helper[state]();

      tag.labelIds = null;

      expect(tag.labels.models).toEqual([]);
      expect(tag.labelIds).toEqual([]);

      tag.save();
      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.labels.includes(tag)).toBeFalsy();
      });
    });
  });
});
