import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | Named | association #set", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent`, assert => {
      let [post] = this.helper[state]();
      let savedAuthor = this.helper.savedParent();

      post.author = savedAuthor;

      expect(post.authorId).toEqual(savedAuthor.id);
      expect(post.author).toEqual(savedAuthor);
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [post] = this.helper[state]();
      let newAuthor = this.helper.newParent();

      post.author = newAuthor;

      expect(post.authorId).toEqual(null);
      expect(post.author).toEqual(newAuthor);
    });

    test(`a ${state} can update its association to a null parent`, assert => {
      let [post] = this.helper[state]();

      post.author = null;

      expect(post.authorId).toEqual(null);
      expect(post.author).toEqual(null);
    });
  });
});
