import Helper, { states } from "./_helper";
import { module, test } from "qunit";

describe("Integration | ORM | Belongs To | Named | association #setId", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parentId, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a saved parent via parentId`, assert => {
      let [post] = this.helper[state]();
      let savedAuthor = this.helper.savedParent();

      post.authorId = savedAuthor.id;

      expect(post.authorId).toEqual(savedAuthor.id);
      expect(post.author).toEqual(savedAuthor);
    });
  });

  ["savedChildSavedParent", "newChildSavedParent"].forEach(state => {
    test(`a ${state} can clear its association via a null parentId`, assert => {
      let [post] = this.helper[state]();

      post.authorId = null;

      expect(post.authorId).toEqual(null);
      expect(post.author).toEqual(null);
    });
  });
});
