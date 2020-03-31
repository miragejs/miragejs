import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | One-Way Reflexive | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [tag] = helper[state]();
      let savedTag = helper.savedChild();

      tag.tags = [savedTag];

      expect(tag.tags.includes(savedTag)).toBeTruthy();
      expect(tag.tagIds[0]).toEqual(savedTag.id);
      expect(savedTag.tags.includes(tag)).toBeFalsy();

      tag.save();
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [tag] = helper[state]();
      let newTag = helper.newChild();

      tag.tags = [newTag];

      expect(tag.tags.includes(newTag)).toBeTruthy();
      expect(tag.tagIds[0]).toBeUndefined();
      expect(newTag.tags.includes(tag)).toBeFalsy();

      tag.save();
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [tag] = helper[state]();

      tag.tags = [];

      expect(tag.tagIds).toBeEmpty();
      expect(tag.tags.models).toHaveLength(0);

      tag.save();
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [tag] = helper[state]();

      tag.tags = null;

      expect(tag.tagIds).toBeEmpty();
      expect(tag.tags.models).toHaveLength(0);

      tag.save();
    });
  });
});
