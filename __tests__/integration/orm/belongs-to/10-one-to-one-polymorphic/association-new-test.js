import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | association #new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach((state) => {

    test(`a ${state} can build a new associated parent`, assert => {
      let [ comment ] = this.helper[state]();

      let post = comment.newCommentable('post', { age: 300 });

      expect(!post.id).toBeTruthy();
      expect(comment.commentable).toEqual(post);
      expect(comment.commentableId).toEqual({ type: 'post', id: undefined });
      expect(post.comment).toEqual(comment);
      expect(post.commentId).toEqual(comment.id);

      comment.save();

      expect(post.id).toBeTruthy();
      expect(comment.commentableId).toEqual({ type: 'post', id: post.id });
    });

  });
});
