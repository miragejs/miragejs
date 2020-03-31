import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | One-way Polymorphic | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [user] = helper[state]();
      let savedPost = helper.savedChild();

      user.things = [savedPost];

      expect(user.things.models.includes(savedPost)).toBeTruthy();
      expect(
        user.thingIds.find(
          ({ id, type }) => id === savedPost.id && type === "post"
        )
      ).toBeTruthy();
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = helper[state]();
      let newPost = helper.newChild();

      user.things = [newPost];

      expect(user.thingIds).toEqual([{ type: "post", id: undefined }]);
      expect(user.things.models[0]).toEqual(newPost);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = helper[state]();

      user.things = [];

      expect(user.thingIds).toBeEmpty();
      expect(user.things.models).toHaveLength(0);
    });

    test(`a ${state} can clear its association via null`, () => {
      let [user] = helper[state]();

      user.things = null;

      expect(user.thingIds).toBeEmpty();
      expect(user.things.models).toHaveLength(0);
    });
  });
});
