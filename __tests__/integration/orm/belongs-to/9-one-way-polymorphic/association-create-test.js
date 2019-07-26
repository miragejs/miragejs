import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-way Polymorphic | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, () => {
      let [comment] = this.helper[state]();

      let post = comment.createCommentable("post", { title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(comment.commentable.attrs).toEqual(post.attrs);
      expect(comment.commentableId).toEqual({ id: post.id, type: "post" });
      expect(this.helper.db.posts.find(post.id)).toBeTruthy();
    });
  });
});
