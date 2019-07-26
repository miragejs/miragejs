import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many-to-many Polymorphic | association #new", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, assert => {
      let [user] = this.helper[state]();
      let initialCount = user.commentables.models.length;

      let post = user.newCommentable("post", { title: "Lorem ipsum" });

      expect(!post.id).toBeTruthy();
      expect(user.commentables.models.length).toEqual(initialCount + 1);
      expect(post.users.models.length).toEqual(1);

      post.save();

      expect(post.attrs).toEqual({
        id: post.id,
        title: "Lorem ipsum",
        userIds: [user.id]
      });
      expect(user.commentables.models.length).toEqual(initialCount + 1);
      expect(user.commentables.includes(post)).toBeTruthy();
      expect(
        user.commentableIds.find(obj => {
          return obj.id === post.id && obj.type === "post";
        })
      ).toBeTruthy();
      expect(post.users.includes(user)).toBeTruthy();
    });
  });
});
