import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Basic | association #setIds", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [user] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.postIds = [savedPost.id];

      expect(user.posts.models[0].attrs).toEqual(savedPost.attrs);
      expect(user.postIds).toEqual([savedPost.id]);
    });

    test(`a ${state} can clear its association via a null parentId`, () => {
      let [user] = this.helper[state]();

      user.postIds = null;

      expect(user.posts.models).toEqual([]);
      expect(user.postIds).toEqual([]);
    });
  });
});
