import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named Reflexive Explicit Inverse | association #setIds", () => {
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

      tag.labelIds = [savedTag.id];

      expect(tag.labels.models[0].attrs).toEqual(savedTag.attrs);
      expect(tag.labelIds).toEqual([savedTag.id]);

      tag.save();
      savedTag.reload();

      expect(savedTag.labels.models[0].attrs).toEqual(tag.attrs);
      originalTags.forEach((originalTag) => {
        if (originalTag.isSaved()) {
          originalTag.reload();
          expect(originalTag.labels.includes(tag)).toBeFalsy();
        }
      });
    });

    test(`a ${state} can clear its association via a null childIds`, () => {
      let [tag, originalTags] = helper[state]();

      tag.labelIds = null;

      expect(tag.labels.models).toBeEmpty();
      expect(tag.labelIds).toBeEmpty();

      tag.save();
      originalTags.forEach((originalTag) => {
        originalTag.reload();
        expect(originalTag.labels.includes(tag)).toBeFalsy();
      });
    });
  });
});
