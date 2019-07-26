import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | One-to-one Polymorphic | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, () => {
      let [comment, post] = helper[state]();

      // We use .attrs here because otherwise deepEqual goes on infinite recursive comparison
      if (post) {
        expect(comment.commentable.attrs).toEqual(post.attrs);
        expect(comment.commentableId).toEqual({ type: "post", id: post.id });
      } else {
        expect(comment.commentable).toEqual(null);
        expect(comment.commentableId).toEqual(null);
      }

      // If there's a post in this state, make sure the inverse association is correct
      if (post) {
        expect(post.comment.attrs).toEqual(comment.attrs);
        expect(post.commentId).toEqual(comment.id);
      }
    });
  });
});
