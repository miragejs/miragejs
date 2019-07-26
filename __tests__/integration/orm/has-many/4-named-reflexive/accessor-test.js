import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named Reflexive | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  states.forEach(state => {
    test(`the references of a ${state} are correct`, () => {
      let [tag, tags] = helper[state]();

      expect(tag.labels.models).toHaveLength(tags.length);
      expect(tag.labelIds).toHaveLength(tags.length);

      tags.forEach(t => {
        expect(tag.labels.includes(t)).toBeTruthy();

        if (t.isSaved()) {
          expect(tag.labelIds.indexOf(t.id) > -1).toBeTruthy();
        }

        // Check the inverse
        expect(t.labels.includes(tag)).toBeTruthy();
      });
    });
  });
});
