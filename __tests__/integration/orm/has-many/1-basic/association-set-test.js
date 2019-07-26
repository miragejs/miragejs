import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Basic | association #set", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [user] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.posts = [savedPost];

      expect(user.posts.models.indexOf(savedPost) > -1).toBeTruthy();
      expect(user.postIds.indexOf(savedPost.id) > -1).toBeTruthy();
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = this.helper[state]();
      let newPost = this.helper.newChild();

      user.posts = [newPost];

      expect(user.postIds).toEqual([undefined]);
      expect(user.posts.models[0]).toEqual(newPost);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = this.helper[state]();

      user.posts = [];

      expect(user.postIds).toBeEmpty();
      expect(user.posts.models.length).toEqual(0);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = this.helper[state]();

      user.posts = null;

      expect(user.postIds).toBeEmpty();
      expect(user.posts.models.length).toEqual(0);
    });
  });
});
