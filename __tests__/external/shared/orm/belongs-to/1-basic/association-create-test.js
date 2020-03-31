import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Basic | association #create", () => {
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
      let [post] = helper[state]();

      let ganon = post.createAuthor({ name: "Ganon" });

      expect(ganon.id).toBeTruthy();
      expect(post.author.attrs).toEqual(ganon.attrs);
      expect(post.authorId).toEqual(ganon.id);
      expect(helper.schema.posts.find(post.id).authorId).toEqual(ganon.id);
    });
  });
});
