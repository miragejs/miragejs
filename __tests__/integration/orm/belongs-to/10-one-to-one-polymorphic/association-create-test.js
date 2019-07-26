import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-to-one Polymorphic | association #create", () => {
  beforeEach(() => {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, () => {
      let [comment] = this.helper[state]();

      let post = comment.createCommentable("post", { title: "Lorem" });

      expect(post.id).toBeTruthy();
      expect(comment.commentable.attrs).toEqual(post.attrs);
      expect(post.comment.attrs).toEqual(comment.attrs);
      expect(comment.commentableId).toEqual({ type: "post", id: post.id });
      expect(
        this.helper.schema.comments.find(comment.id).commentableId
      ).toEqual({ type: "post", id: post.id });
    });
  });
});
