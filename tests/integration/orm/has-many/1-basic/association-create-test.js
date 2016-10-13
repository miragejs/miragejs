import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Basic | association #create', {
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
    let initialCount = user.posts.models.length;

    let post = user.createPost({ title: 'Lorem ipsum' });

    assert.ok(post.id, 'the child was persisted');
    assert.equal(user.posts.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(user.posts.includes(post), 'the model was added to user.posts');
    assert.ok(user.postIds.indexOf(post.id) > -1, 'the id was added to the fks array');
    assert.ok(user.attrs.postIds.indexOf(post.id) > -1, 'fks were persisted');
  });

});
