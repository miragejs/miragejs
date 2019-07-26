import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-way Polymorphic | association #setId", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [comment] = this.helper[state]();
      let savedPost = this.helper.savedParent();

      comment.commentableId = { id: savedPost.id, type: "post" };

      expect(comment.commentableId).toEqual({ id: savedPost.id, type: "post" });
      expect(comment.commentable.attrs).toEqual(savedPost.attrs);
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
