import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-to-one Polymorphic | association #create", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can create an associated parent`, () => {
      let [comment] = helper[state]();

      let post = comment.createCommentable("post", { title: "Lorem" });

      expect(post.id).toBeTruthy();
      expect(comment.commentable.attrs).toEqual(post.attrs);
      expect(post.comment.attrs).toEqual(comment.attrs);
      expect(comment.commentableId).toEqual({ type: "post", id: post.id });
      expect(helper.schema.comments.find(comment.id).commentableId).toEqual({
        type: "post",
        id: post.id,
      });
    });
  });
});
