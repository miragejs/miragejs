import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many-to-many Polymorphic | association #create", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, () => {
      let [user] = this.helper[state]();
      let initialCount = user.commentables.models.length;

      let post = user.createCommentable("post", { title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(user.commentables.models.length).toEqual(initialCount + 1);
      expect(user.commentables.includes(post)).toBeTruthy();
      expect(
        user.commentableIds.find(obj => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(
        user.attrs.commentableIds.find(obj => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(post.users.includes(user)).toBeTruthy();
    });
  });
});
