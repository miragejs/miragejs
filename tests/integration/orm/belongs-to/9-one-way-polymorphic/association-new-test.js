import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | association #new', {
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

    let post = comment.newCommentable('post', { title: 'Lorem ipsum' });

    assert.ok(!post.id, 'the parent was not persisted');
    assert.deepEqual(comment.commentable, post);
    assert.deepEqual(comment.commentableId, { id: undefined, type: 'post' });

    comment.save();

    assert.ok(post.id, 'saving the child persists the parent');
    assert.deepEqual(comment.commentableId, { id: post.id, type: 'post' }, 'the childs fk was updated');
  });

});
