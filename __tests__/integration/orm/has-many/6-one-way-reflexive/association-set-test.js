import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | One-Way Reflexive | association #set", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a list of saved children`, assert => {
      let [tag] = this.helper[state]();
      let savedTag = this.helper.savedChild();

      tag.tags = [savedTag];

      expect(tag.tags.includes(savedTag)).toBeTruthy();
      expect(tag.tagIds[0]).toEqual(savedTag.id);
      expect(savedTag.tags.includes(tag)).toBeFalsy();

      tag.save();
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [tag] = this.helper[state]();
      let newTag = this.helper.newChild();

      tag.tags = [newTag];

      expect(tag.tags.includes(newTag)).toBeTruthy();
      expect(tag.tagIds[0]).toEqual(undefined);
      expect(newTag.tags.includes(tag)).toBeFalsy();

      tag.save();
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [tag] = this.helper[state]();

      tag.tags = [];

      expect(tag.tagIds).toEqual([]);
      expect(tag.tags.models.length).toEqual(0);

      tag.save();
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [tag] = this.helper[state]();

      tag.tags = null;

      expect(tag.tagIds).toEqual([]);
      expect(tag.tags.models.length).toEqual(0);

      tag.save();
    });
  });
});
