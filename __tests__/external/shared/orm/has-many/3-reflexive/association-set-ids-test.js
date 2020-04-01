import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Reflexive | association #setIds", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`a ${state} can update its association to include a saved child via childIds`, () => {
      let [tag, originalTags] = helper[state]();
      let savedTag = helper.savedChild();

      tag.tagIds = [savedTag.id];

      expect(tag.tags.models[0].attrs).toEqual(savedTag.attrs);
      expect(tag.tagIds).toEqual([savedTag.id]);

      tag.save();
      savedTag.reload();

      expect(savedTag.tags.models[0].attrs).toEqual(tag.attrs);
      originalTags.forEach((originalTag) => {
        if (originalTag.isSaved()) {
          originalTag.reload();
          expect(originalTag.tags.includes(tag)).toBeFalsy();
        }
      });
    });

    test(`a ${state} can clear its association via a null childIds`, () => {
      let [tag, originalTags] = helper[state]();

      tag.tagIds = null;

      expect(tag.tags.models).toBeEmpty();
      expect(tag.tagIds).toBeEmpty();

      tag.save();
      originalTags.forEach((originalTag) => {
        originalTag.reload();
        expect(originalTag.tags.includes(tag)).toBeFalsy();
      });
    });
  });
});
