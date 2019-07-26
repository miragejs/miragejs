import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named Reflexive Explicit Inverse | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated child`, () => {
      let [tag] = this.helper[state]();
      let initialCount = tag.labels.models.length;

      let orangeTag = tag.createLabel({ name: "Orange" });

      expect(orangeTag.id).toBeTruthy();
      expect(tag.labels.models.length).toEqual(initialCount + 1);
      expect(tag.labels.includes(orangeTag)).toBeTruthy();
      expect(tag.labelIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(tag.attrs.labelIds.indexOf(orangeTag.id) > -1).toBeTruthy();
      expect(orangeTag.labels.includes(tag)).toBeTruthy();
    });
  });
});
