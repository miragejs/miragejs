import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ post, author ] = this.helper[state]();

      expect(post.author).toEqual(author ? author : null);
      expect(post.authorId).toEqual(author ? author.id : null);
    });

  });
});
