import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many-to-many Polymorphic | accessor", () => {
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

      expect(user.commentables.models).toHaveLength(posts.length);
      expect(user.commentableIds).toHaveLength(posts.length);

      posts.forEach((post, i) => {
        expect(user.commentables.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(user.commentableIds[i]).toEqual({ type: "post", id: post.id });
        }

        // Check the inverse
        expect(post.users.includes(user)).toBeTruthy();
      });
    });
  });
});
