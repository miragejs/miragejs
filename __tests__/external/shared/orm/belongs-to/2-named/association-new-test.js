import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Belongs To | Named | association #new", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {
    test(`a ${state} can build a new associated parent`, () => {
      let [post] = helper[state]();

      let ganon = post.newAuthor({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(post.author).toEqual(ganon);
      expect(post.authorId).toBeNil();

      post.save();

      expect(ganon.id).toBeTruthy();
      expect(post.authorId).toEqual(ganon.id);
    });
  });
});
