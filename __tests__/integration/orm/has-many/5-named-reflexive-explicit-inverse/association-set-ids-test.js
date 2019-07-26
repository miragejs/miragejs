import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named Reflexive Explicit Inverse | association #setIds", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`a ${state} can update its association to include a saved child via childIds`, () => {
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

    test(`a ${state} can clear its association via a null childIds`, () => {
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
