import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | One-Way Reflexive | accessor", () => {
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
      });
    });
  });
});
