import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many Polymorphic | association #setIds", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [user, originalPosts] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.thingIds = [{ type: "post", id: savedPost.id }];

      expect(user.things.includes(savedPost)).toBeTruthy();
      expect(user.thingIds).toEqual([{ type: "post", id: savedPost.id }]);

      user.save();
      savedPost.reload();

      // Check the inverse
      expect(savedPost.user.attrs).toEqual(user.attrs);
      expect(savedPost.userId).toEqual(user.id);

      // Check old associates
      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user, originalPosts] = this.helper[state]();

      user.thingIds = null;

      expect(user.things.models).toBeEmpty();
      expect(user.thingIds).toBeEmpty();

      user.save();

      // Check old associates
      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });
  });
});
