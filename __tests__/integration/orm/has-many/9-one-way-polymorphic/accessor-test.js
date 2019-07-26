import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | One-way Polymorphic | accessor", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, () => {
      let [user, posts] = this.helper[state]();

      expect(user.things.models.length).toEqual(posts.length);
      expect(user.thingIds.length).toEqual(posts.length);

      posts.forEach((post, i) => {
        expect(user.things.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(user.thingIds[i]).toEqual({ type: "post", id: post.id });
        }
      });
    });
  });
});
