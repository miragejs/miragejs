import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-way Polymorphic | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {
    test(`the references of a ${state} are correct`, () => {
      let [comment, post] = helper[state]();

      expect(comment.commentable).toEqual(post ? post : null);
      expect(comment.commentableId).toEqual(
        post ? { id: post.id, type: "post" } : null
      );
    });
  });
});
