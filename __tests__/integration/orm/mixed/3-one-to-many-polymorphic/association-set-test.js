import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many Polymorphic | association #set", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [user, originalPosts] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.things = [savedPost];

      expect(user.things.includes(savedPost)).toBeTruthy();
      expect(
        user.thingIds.find(
          ({ id, type }) => id === savedPost.id && type === "post"
        )
      ).toBeTruthy();

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user, originalPosts] = this.helper[state]();
      let newPost = this.helper.newChild();

      user.things = [newPost];

      expect(user.thingIds).toEqual([{ type: "post", id: undefined }]);
      expect(user.things.includes(newPost)).toBeTruthy();

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user, originalPosts] = this.helper[state]();

      user.things = [];

      expect(user.thingIds).toBeEmpty();
      expect(user.things.models.length).toEqual(0);

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user, originalPosts] = this.helper[state]();

      user.things = null;

      expect(user.thingIds).toBeEmpty();
      expect(user.things.models.length).toEqual(0);

      user.save();

      originalPosts.forEach(post => {
        if (post.isSaved()) {
          post.reload();
          expect(post.user).toEqual(null);
        }
      });
    });
  });
});
