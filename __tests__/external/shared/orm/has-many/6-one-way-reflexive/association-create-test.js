import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | One-Way Reflexive | association #create", () => {
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

      expect(orangeTag.id).toBeTruthy();
      expect(tag.tags.models).toHaveLength(initialCount + 1);
      expect(tag.tags.includes(orangeTag)).toBeTruthy();
      expect(tag.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(tag.attrs.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(orangeTag.tags.includes(tag)).toBeFalsy();
    });
  });
});
