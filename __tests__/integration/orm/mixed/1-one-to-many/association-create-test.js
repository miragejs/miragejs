import Helper, { states } from "./_helper";

describe("Integration | ORM | Mixed | One To Many | association #create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = helper[state]();
      let initialCount = user.posts.models.length;

      let post = user.createPost({ title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(user.posts.models).toHaveLength(initialCount + 1);
      expect(user.posts.includes(post)).toBeTruthy();
      expect(user.postIds.indexOf(post.id) > -1).toBeTruthy();
      expect(user.attrs.postIds.indexOf(post.id) > -1).toBeTruthy();

      // Check the inverse
      expect(post.user.attrs).toEqual(user.attrs);
      expect(post.userId).toEqual(user.id);
    });
  });
});
