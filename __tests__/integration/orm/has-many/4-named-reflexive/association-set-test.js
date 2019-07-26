import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named Reflexive | association #set", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [tag, originalTags] = this.helper[state]();
      let savedTag = this.helper.savedChild();

      tag.labels = [savedTag];

      expect(tag.labels.includes(savedTag)).toBeTruthy();
      expect(tag.labelIds[0]).toEqual(savedTag.id);
      expect(savedTag.labels.includes(tag)).toBeTruthy();

      tag.save();

      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.labels.includes(tag)).toBeFalsy();
      });
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [tag, originalTags] = this.helper[state]();
      let newTag = this.helper.newChild();

      tag.labels = [newTag];

      expect(tag.labels.includes(newTag)).toBeTruthy();
      expect(tag.labelIds[0]).toEqual(undefined);
      expect(newTag.labels.includes(tag)).toBeTruthy();

      tag.save();

      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.labels.includes(tag)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [tag, originalTags] = this.helper[state]();

      tag.labels = [];

      expect(tag.labelIds).toEqual([]);
      expect(tag.labels.models.length).toEqual(0);

      tag.save();
      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.labels.includes(tag)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [tag, originalTags] = this.helper[state]();

      tag.labels = null;

      expect(tag.labelIds).toEqual([]);
      expect(tag.labels.models.length).toEqual(0);

      tag.save();
      originalTags.forEach(originalTag => {
        originalTag.reload();
        expect(originalTag.labels.includes(tag)).toBeFalsy();
      });
    });
  });
});
