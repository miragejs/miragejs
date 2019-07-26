import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Named | association #set", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [user] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.blogPosts = [savedPost];

      expect(user.blogPosts.models.indexOf(savedPost) > -1).toBeTruthy();
      expect(user.blogPostIds.indexOf(savedPost.id) > -1).toBeTruthy();
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [user] = this.helper[state]();
      let newPost = this.helper.newChild();

      user.blogPosts = [newPost];

      expect(user.blogPostIds).toEqual([undefined]);
      expect(user.blogPosts.models[0]).toEqual(newPost);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = this.helper[state]();

      user.blogPosts = [];

      expect(user.blogPostIds).toEqual([]);
      expect(user.blogPosts.models.length).toEqual(0);
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [user] = this.helper[state]();

      user.blogPosts = null;

      expect(user.blogPostIds).toEqual([]);
      expect(user.blogPosts.models.length).toEqual(0);
    });
  });
});
