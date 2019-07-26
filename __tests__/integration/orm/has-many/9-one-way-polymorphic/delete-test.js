import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | One-way Polymorphic | delete", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting children updates the parent's foreign key for a ${state}`, () => {
      let [user, posts] = this.helper[state]();

      if (posts && posts.length) {
        posts.forEach(p => p.destroy());
        user.reload();
      }

      expect(user.things.length).toEqual(0);
      expect(user.thingIds.length).toEqual(0);
    });
  });
});
