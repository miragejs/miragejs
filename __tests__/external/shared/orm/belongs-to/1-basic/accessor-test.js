import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Basic | accessor", () => {
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
      let [post, author] = helper[state]();

      expect(post.author).toEqual(author ? author : null);
      expect(post.authorId).toEqual(author ? author.id : null);
    });
  });
});
