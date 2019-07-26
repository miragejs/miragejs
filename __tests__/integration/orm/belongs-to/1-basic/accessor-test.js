import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Basic | accessor", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach(state => {
    test(`the references of a ${state} are correct`, () => {
      let [post, author] = this.helper[state]();

      expect(post.author).toEqual(author ? author : null);
      expect(post.authorId).toEqual(author ? author.id : null);
    });
  });
});
