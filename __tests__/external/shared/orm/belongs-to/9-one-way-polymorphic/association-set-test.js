import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-way Polymorphic | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a saved parent`, () => {
      let [comment] = helper[state]();
      let savedPost = helper.savedParent();

      comment.commentable = savedPost;

      expect(comment.commentableId).toEqual({ id: savedPost.id, type: "post" });
      expect(comment.commentable).toEqual(savedPost);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [comment] = helper[state]();
      let newPost = helper.newParent();

      comment.commentable = newPost;

      expect(comment.commentableId).toEqual({ id: undefined, type: "post" });
      expect(comment.commentable).toEqual(newPost);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [comment] = helper[state]();

      comment.commentable = null;

      expect(comment.commentableId).toBeNil();
      expect(comment.commentable).toBeNil();
    });
  });
});
