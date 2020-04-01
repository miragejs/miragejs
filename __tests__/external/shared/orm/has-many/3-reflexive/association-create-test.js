import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Reflexive | association #create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can create an associated child`, () => {
      let [tag] = helper[state]();
      let initialCount = tag.tags.models.length;

      let orangeTag = tag.createTag({ name: "Orange" });
      let blueTag = tag.createTag({ name: "Blue" });

      expect(orangeTag.id).toBeTruthy();
      expect(blueTag.id).toBeTruthy();
      expect(tag.tags.models).toHaveLength(initialCount + 2);
      expect(tag.tags.includes(orangeTag)).toBeTruthy();
      expect(tag.tags.includes(blueTag)).toBeTruthy();
      expect(tag.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(tag.tagIds.indexOf(blueTag.id) > -1).toBeTruthy();
      expect(tag.attrs.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(tag.attrs.tagIds.indexOf(blueTag.id) > -1).toBeTruthy();

      // Check the inverse
      expect(orangeTag.tags.models).toHaveLength(1);
      expect(orangeTag.tags.includes(tag)).toBeTruthy();
      expect(blueTag.tags.models).toHaveLength(1);
      expect(blueTag.tags.includes(tag)).toBeTruthy();
    });
  });
});
