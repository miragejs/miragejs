import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-way Polymorphic | association #set", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [comment] = this.helper[state]();
      let savedPost = this.helper.savedParent();

      comment.commentable = savedPost;

      expect(comment.commentableId).toEqual({ id: savedPost.id, type: "post" });
      expect(comment.commentable).toEqual(savedPost);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [comment] = this.helper[state]();
      let newPost = this.helper.newParent();

      comment.commentable = newPost;

      expect(comment.commentableId).toEqual({ id: undefined, type: "post" });
      expect(comment.commentable).toEqual(newPost);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [comment] = this.helper[state]();

      comment.commentable = null;

      expect(comment.commentableId).toEqual(null);
      expect(comment.commentable).toEqual(null);
    });
  });
});
