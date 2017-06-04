import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ comment ] = this.helper[state]();

    let post = comment.newCommentable('post', { age: 300 });

    assert.ok(!post.id, 'the parent was not persisted');
    assert.deepEqual(comment.commentable, post);
    assert.deepEqual(comment.commentableId, { type: 'post', id: undefined });
    assert.deepEqual(post.comment, comment, 'the inverse was set');
    assert.equal(post.commentId, comment.id);

    comment.save();

    assert.ok(post.id, 'saving the child persists the parent');
    assert.deepEqual(comment.commentableId, { type: 'post', id: post.id }, 'the childs fk was updated');
  });

});
