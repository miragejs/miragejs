import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many Polymorphic | accessor", () => {
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

      posts.forEach(post => {
        expect(user.things.includes(post)).toBeTruthy();

        if (post.isSaved()) {
          expect(
            user.thingIds.find(obj => {
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
