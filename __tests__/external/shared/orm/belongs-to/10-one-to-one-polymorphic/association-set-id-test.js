import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-to-one Polymorphic | association #setId", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent via parentId`, () => {
      let [comment] = helper[state]();
      let post = helper.savedParent();

      comment.commentableId = { type: "post", id: post.id };

      expect(comment.commentableId).toEqual({ type: "post", id: post.id });
      expect(comment.commentable.attrs).toEqual(post.attrs);

      comment.save();
      post.reload();

      expect(post.commentId).toEqual(comment.id);
      expect(post.comment.attrs).toEqual(comment.attrs);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach((state) => {
    test(`a ${state} can clear its association via a null parentId`, () => {
      let [comment] = helper[state]();

      comment.commentableId = null;

      expect(comment.commentableId).toBeNil();
      expect(comment.commentable).toBeNil();
    });
  });
});
