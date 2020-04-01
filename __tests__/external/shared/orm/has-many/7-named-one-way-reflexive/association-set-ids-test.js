import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named One-Way Reflexive | association #setIds", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`a ${state} can update its association to include a saved child via childIds`, () => {
      let [tag] = helper[state]();
      let savedTag = helper.savedChild();

      tag.labelIds = [savedTag.id];

      expect(tag.labels.models[0].attrs).toEqual(savedTag.attrs);
      expect(tag.labelIds).toEqual([savedTag.id]);

      tag.save();
      savedTag.reload();

      expect(savedTag.labels.models).toHaveLength(0);
    });

    test(`a ${state} can clear its association via a null childIds`, () => {
      let [tag] = helper[state]();

      tag.labelIds = null;

      expect(tag.labels.models).toBeEmpty();
      expect(tag.labelIds).toBeEmpty();

      tag.save();
    });
  });
});
