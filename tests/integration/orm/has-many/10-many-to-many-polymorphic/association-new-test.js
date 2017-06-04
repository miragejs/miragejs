import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many-to-many Polymorphic | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let initialCount = user.commentables.models.length;

    let post = user.newCommentable('post', { title: 'Lorem ipsum' });

    assert.ok(!post.id, 'the child was not persisted');
    assert.equal(user.commentables.models.length, initialCount + 1);
    assert.equal(post.users.models.length, 1, 'the inverse was set');

    post.save();

    assert.deepEqual(post.attrs, { id: post.id, title: 'Lorem ipsum', userIds: [ user.id ] }, 'the child was persisted');
    assert.equal(user.commentables.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(user.commentables.includes(post), 'the model was added to user.commentables');
    assert.ok(user.commentableIds.find(obj => {
      return (obj.id === post.id && obj.type === 'post');
    }), 'the id was added to the fks array');
    assert.ok(post.users.includes(user), 'the inverse was set');
  });

});
