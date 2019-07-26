import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Has Many | Many-to-many Polymorphic | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, assert => {
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
