import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Named One-Way Reflexive | association #set", () => {
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

      tag.labels = [savedTag];

      expect(tag.labels.includes(savedTag)).toBeTruthy();
      expect(tag.labelIds[0]).toEqual(savedTag.id);
      expect(savedTag.labels.includes(tag)).toBeFalsy();

      tag.save();
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [tag] = helper[state]();
      let newTag = helper.newChild();

      tag.labels = [newTag];

      expect(tag.labels.includes(newTag)).toBeTruthy();
      expect(tag.labelIds[0]).toBeUndefined();
      expect(newTag.labels.includes(tag)).toBeFalsy();

      tag.save();
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [tag] = helper[state]();

      tag.labels = [];

      expect(tag.labelIds).toBeEmpty();
      expect(tag.labels.models).toHaveLength(0);

      tag.save();
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [tag] = helper[state]();

      tag.labels = null;

      expect(tag.labelIds).toBeEmpty();
      expect(tag.labels.models).toHaveLength(0);

      tag.save();
    });
  });
});
