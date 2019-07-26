import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Basic | accessor", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, () => {
      let [user, posts] = this.helper[state]();

      expect(user.posts.models.length).toEqual(posts.length);
      expect(user.postIds.length).toEqual(posts.length);

      posts.forEach((post, i) => {
        expect(user.posts.models[i]).toEqual(posts[i]);

        if (post.isSaved()) {
          expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
        }
      });
    });
  });
});
