import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Reflexive | association #new", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {
    test(`a ${state} can build a new associated child`, () => {
      let [tag] = helper[state]();
      let initialCount = tag.tags.models.length;

      let blueTag = tag.newTag({ name: "Blue" });

      expect(!blueTag.id).toBeTruthy();
      expect(tag.tags.models).toHaveLength(initialCount + 1);
      expect(blueTag.tags.models).toHaveLength(1);

      blueTag.save();
      tag.reload();

      expect(blueTag.attrs).toEqual({
        id: blueTag.id,
        name: "Blue",
        tagIds: [tag.id],
      });
      expect(tag.tags.models).toHaveLength(initialCount + 1);
      expect(tag.tags.includes(blueTag)).toBeTruthy();
      expect(tag.tagIds.indexOf(blueTag.id) > -1).toBeTruthy();
      expect(blueTag.tags.includes(tag)).toBeTruthy();
    });
  });
});
