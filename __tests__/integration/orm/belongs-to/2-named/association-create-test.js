import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | Named | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a belongs-to association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated parent`, assert => {
      let [post] = this.helper[state]();

      let ganon = post.createAuthor({ name: "Ganon" });

      expect(ganon.id).toBeTruthy();
      expect(post.author.attrs).toEqual(ganon.attrs);
      expect(post.authorId).toEqual(ganon.id);
      expect(this.helper.schema.posts.find(post.id).authorId).toEqual(ganon.id);
    });
  });
});
