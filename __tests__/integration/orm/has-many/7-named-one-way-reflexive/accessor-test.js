import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named One-Way Reflexive | accessor", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`the references of a ${state} are correct`, assert => {
      let [tag, tags] = this.helper[state]();

      expect(tag.labels.models.length).toEqual(tags.length);
      expect(tag.labelIds.length).toEqual(tags.length);

      tags.forEach(t => {
        expect(tag.labels.includes(t)).toBeTruthy();

        if (t.isSaved()) {
          expect(tag.labelIds.indexOf(t.id) > -1).toBeTruthy();
        }
      });
    });
  });
});
