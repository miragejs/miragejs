import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Reflexive | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`the references of a ${state} are correct`, () => {
      let [tag, tags] = helper[state]();

      expect(tag.tags.models).toHaveLength(tags.length);
      expect(tag.tagIds).toHaveLength(tags.length);

      tags.forEach((t) => {
        expect(tag.tags.includes(t)).toBeTruthy();

        if (t.isSaved()) {
          expect(tag.tagIds.indexOf(t.id) > -1).toBeTruthy();
        }

        // Check the inverse
        expect(t.tags.includes(tag)).toBeTruthy();
      });
    });
  });
});
