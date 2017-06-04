import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many-to-many Polymorphic | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a has-many association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let initialCount = user.commentables.models.length;

    let post = user.createCommentable('post', { title: 'Lorem ipsum' });

    assert.ok(post.id, 'the child was persisted');
    assert.equal(user.commentables.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(user.commentables.includes(post), 'the model was added to the association');
    assert.ok(user.commentableIds.find(obj => {
      return (obj.id === post.id && obj.type === 'post');
    }), 'the id was added to the fks array');
    assert.ok(user.attrs.commentableIds.find(obj => {
      return (obj.id === post.id && obj.type === 'post');
    }), 'fks were persisted');
    assert.ok(post.users.includes(user), 'the inverse was set');
  });

});
