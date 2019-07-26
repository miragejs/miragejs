import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Reflexive | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated child`, () => {
      let [tag] = this.helper[state]();
      let initialCount = tag.tags.models.length;

      let orangeTag = tag.createTag({ name: "Orange" });
      let blueTag = tag.createTag({ name: "Blue" });

      expect(orangeTag.id).toBeTruthy();
      expect(blueTag.id).toBeTruthy();
      expect(tag.tags.models.length).toEqual(initialCount + 2);
      expect(tag.tags.includes(orangeTag)).toBeTruthy();
      expect(tag.tags.includes(blueTag)).toBeTruthy();
      expect(tag.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(tag.tagIds.indexOf(blueTag.id) > -1).toBeTruthy();
      expect(tag.attrs.tagIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(tag.attrs.tagIds.indexOf(blueTag.id) > -1).toBeTruthy();

      // Check the inverse
      expect(orangeTag.tags.models.length).toEqual(1);
      expect(orangeTag.tags.includes(tag)).toBeTruthy();
      expect(blueTag.tags.models.length).toEqual(1);
      expect(blueTag.tags.includes(tag)).toBeTruthy();
    });
  });
});
