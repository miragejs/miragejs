import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Mixed | Many To One | accessor", () => {
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
      let [post, user] = helper[state]();

      if (post.user) {
        expect(post.user.equals(user)).toBeTruthy();
      } else {
        expect(post.user).toBeNull();
        expect(user).toBeNull();
      }
      expect(post.userId).toEqual(user ? user.id : null);

      post.save();

      // Check the inverse
      if (user && user.isSaved()) {
        user.reload();
        expect(user.posts.includes(post)).toBeTruthy();
      }
    });
  });
});
