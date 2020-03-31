import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | One-way Polymorphic | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {
    test(`the references of a ${state} are correct`, () => {
      let [user, posts] = helper[state]();

      expect(user.things.models).toHaveLength(posts.length);
      expect(user.thingIds).toHaveLength(posts.length);

      posts.forEach((post, i) => {
        expect(user.things.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(user.thingIds[i]).toEqual({ type: "post", id: post.id });
        }
      });
    });
  });
});
