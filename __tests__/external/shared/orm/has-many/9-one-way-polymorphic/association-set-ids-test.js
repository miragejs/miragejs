import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | One-way Polymorphic | association #setIds", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [user] = helper[state]();
      let savedPost = helper.savedChild();

      user.thingIds = [{ type: "post", id: savedPost.id }];

      expect(user.things.includes(savedPost)).toBeTruthy();
      expect(
        user.thingIds.find(
          ({ id, type }) => id === savedPost.id && type === "post"
        )
      ).toBeTruthy();
    });

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user] = helper[state]();

      user.thingIds = null;

      expect(user.things.models).toBeEmpty();
      expect(user.thingIds).toBeEmpty();
    });
  });
});
