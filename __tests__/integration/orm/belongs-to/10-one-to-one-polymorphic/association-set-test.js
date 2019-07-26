import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-to-one Polymorphic | association #set", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [comment] = this.helper[state]();
      let post = this.helper.savedParent();

      comment.commentable = post;

      expect(comment.commentableId).toEqual({ type: "post", id: post.id });
      expect(comment.commentable.attrs).toEqual(post.attrs);
      expect(post.commentId).toEqual(comment.id);
      expect(post.comment.attrs).toEqual(comment.attrs);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [comment] = this.helper[state]();
      let post = this.helper.newParent();

      comment.commentable = post;

      expect(comment.commentableId).toEqual({ type: "post", id: undefined });
      expect(comment.commentable.attrs).toEqual(post.attrs);

      expect(post.commentId).toEqual(comment.id);
      expect(post.comment.attrs).toEqual(comment.attrs);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [comment] = this.helper[state]();

      comment.commentable = null;

      expect(comment.commentableId).toEqual(null);
      expect(comment.commentable).toEqual(null);
    });
  });
});
