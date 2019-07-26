import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | One-Way Reflexive | delete", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting children updates the parent's foreign key for a ${state}`, () => {
      let [tag, tags] = this.helper[state]();

      if (tags && tags.length) {
        tags.forEach(t => t.destroy());
        tag.reload();
      }

      expect(tag.tags.length).toEqual(0);
      expect(tag.tagIds.length).toEqual(0);
    });
  });
});
