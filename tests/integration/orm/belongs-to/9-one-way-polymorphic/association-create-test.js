import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-way Polymorphic | association #create', {
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

    let post = comment.createCommentable('post', { title: 'Lorem ipsum' });

    assert.ok(post.id, 'the parent was persisted');
    assert.deepEqual(comment.commentable.attrs, post.attrs);
    assert.deepEqual(comment.commentableId, { id: post.id, type: 'post' });
    assert.ok(this.helper.db.posts.find(post.id), 'the child was persisted');
  });

});
