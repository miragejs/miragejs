import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Basic | association #set", function () {
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
      let [post] = helper[state]();
      let savedAuthor = helper.savedParent();

      post.author = savedAuthor;

      expect(post.authorId).toEqual(savedAuthor.id);
      expect(post.author).toEqual(savedAuthor);
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [post] = helper[state]();
      let newAuthor = helper.newParent();

      post.author = newAuthor;

      expect(post.authorId).toBeNil();
      expect(post.author).toEqual(newAuthor);
    });

    test(`a ${state} can update its association to a null parent`, () => {
      let [post] = helper[state]();

      post.author = null;

      expect(post.authorId).toBeNil();
      expect(post.author).toBeNil();
    });
  });
});
