import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-way Polymorphic | association #setId", () => {
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
      let savedPost = helper.savedParent();

      comment.commentableId = { id: savedPost.id, type: "post" };

      expect(comment.commentableId).toEqual({ id: savedPost.id, type: "post" });
      expect(comment.commentable.attrs).toEqual(savedPost.attrs);
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
