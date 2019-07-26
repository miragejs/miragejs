import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The reference to a belongs-to association is correct, for all states
  */
  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ comment, post ] = this.helper[state]();

      expect(comment.commentable).toEqual(post ? post : null);
      expect(comment.commentableId).toEqual(post ? { id: post.id, type: 'post' } : null);
    });

  });
});
