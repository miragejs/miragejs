import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | One-way Polymorphic | association #create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = helper[state]();
      let initialCount = user.things.models.length;

      let post = user.createThing("post", { title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(user.things.models).toHaveLength(initialCount + 1);
      expect(user.things.includes(post)).toBeTruthy();
      expect(
        user.thingIds.find((obj) => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(
        user.attrs.thingIds.find((obj) => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
    });
  });
});
