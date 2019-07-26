import Helper, { states } from "./_helper";

describe("Integration | ORM | Belongs To | Named | association #new", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated parent`, () => {
      let [post] = this.helper[state]();

      let ganon = post.newAuthor({ name: "Ganon" });

      expect(!ganon.id).toBeTruthy();
      expect(post.author).toEqual(ganon);
      expect(post.authorId).toEqual(null);

      post.save();

      expect(ganon.id).toBeTruthy();
      expect(post.authorId).toEqual(ganon.id);
    });
  });
});
