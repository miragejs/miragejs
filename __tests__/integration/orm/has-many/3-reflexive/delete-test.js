import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Reflexive | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
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
