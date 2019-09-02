import Helper, { states } from "./_helper";

describe("External |Shared | Schema | Has Many | Reflexive | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach(state => {
    test(`deleting children updates the parent's foreign key for a ${state}`, () => {
      let [tag, tags] = helper[state]();

      if (tags && tags.length) {
        tags.forEach(t => t.destroy());
        tag.reload();
      }

      expect(tag.tags).toHaveLength(0);
      expect(tag.tagIds).toHaveLength(0);
    });
  });
});
