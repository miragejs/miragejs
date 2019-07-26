import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | One-Way Reflexive | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated child`, assert => {
      let [tag] = this.helper[state]();
      let initialCount = tag.tags.models.length;

      let orangeTag = tag.createTag({ name: "Orange" });

      expect(orangeTag.id).toBeTruthy();
      expect(tag.tags.models.length).toEqual(initialCount + 1);
      expect(tag.tags.includes(orangeTag)).toBeTruthy();
      expect(tag.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(tag.attrs.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(orangeTag.tags.includes(tag)).toBeFalsy();
    });
  });
});
