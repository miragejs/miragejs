import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-to-one Polymorphic | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a belongs-to association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated parent`, function(assert) {
    let [ comment ] = this.helper[state]();

    let post = comment.createCommentable('post', { title: 'Lorem' });

    assert.ok(post.id, 'the parent was persisted');
    assert.deepEqual(comment.commentable.attrs, post.attrs);
    assert.deepEqual(post.comment.attrs, comment.attrs, 'the inverse was set');
    assert.deepEqual(comment.commentableId, { type: 'post', id: post.id });
    assert.deepEqual(this.helper.schema.comments.find(comment.id).commentableId, { type: 'post', id: post.id }, 'the comment was persisted');
  });

});
