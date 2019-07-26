import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many | association #new", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, () => {
      let [user] = this.helper[state]();
      let initialCount = user.posts.models.length;

      let post = user.newPost({ title: "Lorem ipsum" });

      expect(!post.id).toBeTruthy();
      expect(user.posts.models.length).toEqual(initialCount + 1);

      post.save();

      expect(post.attrs).toEqual({
        id: post.id,
        title: "Lorem ipsum",
        userId: user.id
      });
      expect(user.posts.models.length).toEqual(initialCount + 1);
      expect(user.posts.includes(post)).toBeTruthy();
      expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
    });
  });
});
