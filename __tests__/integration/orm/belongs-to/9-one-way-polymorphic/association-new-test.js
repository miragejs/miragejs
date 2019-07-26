import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-way Polymorphic | association #new", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, () => {
      let [comment] = this.helper[state]();

      let post = comment.newCommentable("post", { title: "Lorem ipsum" });

      expect(!post.id).toBeTruthy();
      expect(comment.commentable).toEqual(post);
      expect(comment.commentableId).toEqual({ id: undefined, type: "post" });

      comment.save();

      expect(post.id).toBeTruthy();
      expect(comment.commentableId).toEqual({ id: post.id, type: "post" });
    });
  });
});
