import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | One To Many Polymorphic | accessor", () => {
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

      posts.forEach((post) => {
        expect(user.things.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(
            user.thingIds.find((obj) => {
              return obj.id === post.id && obj.type === "post";
            })
          ).toBeTruthy();
        }

        // Check the inverse
        expect(post.user.attrs).toEqual(user.attrs);
        expect(post.userId).toEqual(user.id);
      });
    });
  });
});
