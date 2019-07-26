import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | One-way Polymorphic | association #setIds", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [user] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.thingIds = [{ type: "post", id: savedPost.id }];

      expect(user.things.includes(savedPost)).toBeTruthy();
      expect(
        user.thingIds.find(
          ({ id, type }) => id === savedPost.id && type === "post"
        )
      ).toBeTruthy();
    });

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user] = this.helper[state]();

      user.thingIds = null;

      expect(user.things.models).toEqual([]);
      expect(user.thingIds).toEqual([]);
    });
  });
});
