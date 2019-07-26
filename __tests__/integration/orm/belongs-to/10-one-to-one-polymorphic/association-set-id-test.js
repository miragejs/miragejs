import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-to-one Polymorphic | association #setId", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [comment] = this.helper[state]();
      let post = this.helper.savedParent();

      comment.commentableId = { type: "post", id: post.id };

      expect(comment.commentableId).toEqual({ type: "post", id: post.id });
      expect(comment.commentable.attrs).toEqual(post.attrs);

      comment.save();
      post.reload();

      expect(post.commentId).toEqual(comment.id);
      expect(post.comment.attrs).toEqual(comment.attrs);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach(state => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [comment] = this.helper[state]();

      comment.commentableId = null;

      expect(comment.commentableId).toEqual(null);
      expect(comment.commentable).toEqual(null);
    });
  });
});
