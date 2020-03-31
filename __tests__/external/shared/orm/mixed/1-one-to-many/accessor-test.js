import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | One To Many | accessor", () => {
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

      expect(user.posts.models).toHaveLength(posts.length);
      expect(user.postIds).toHaveLength(posts.length);

      posts.forEach((post) => {
        expect(user.posts.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
        }

        // Check the inverse
        expect(post.user.attrs).toEqual(user.attrs);
        expect(post.userId).toEqual(user.id);
      });
    });
  });
});
