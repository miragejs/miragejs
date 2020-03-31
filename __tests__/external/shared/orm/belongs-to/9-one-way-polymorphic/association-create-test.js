import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | One-way Polymorphic | association #create", () => {
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

      let post = comment.createCommentable("post", { title: "Lorem ipsum" });

      expect(post.id).toBeTruthy();
      expect(comment.commentable.attrs).toEqual(post.attrs);
      expect(comment.commentableId).toEqual({ id: post.id, type: "post" });
      expect(helper.db.posts.find(post.id)).toBeTruthy();
    });
  });
});
