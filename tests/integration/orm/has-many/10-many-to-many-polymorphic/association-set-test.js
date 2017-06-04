import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many-to-many Polymorphic | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a list of saved children`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();
    let savedPost = this.helper.savedChild();

    user.commentables = [ savedPost ];

    assert.ok(user.commentables.models.includes(savedPost));
    assert.ok(user.commentableIds.find(({ id, type }) => ((id === savedPost.id && type === 'post'))));
    assert.ok(savedPost.users.includes(user), 'the inverse was set');

    user.save();

    originalPosts.forEach(post => {
      post.reload();
      assert.notOk(post.users.includes(user), 'old inverses were cleared');
    });
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();
    let newPost = this.helper.newChild();

    user.commentables = [ newPost ];

    assert.deepEqual(user.commentableIds, [ { type: 'post', id: undefined } ]);
    assert.deepEqual(user.commentables.models[0], newPost);
    assert.ok(newPost.users.includes(user), 'the inverse was set');

    user.save();

    originalPosts.forEach(post => {
      post.reload();
      assert.notOk(post.users.includes(user), 'old inverses were cleared');
    });
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();

    user.commentables = [ ];

    assert.deepEqual(user.commentableIds, [ ]);
    assert.equal(user.commentables.models.length, 0);

    user.save();

    originalPosts.forEach(post => {
      post.reload();
      assert.notOk(post.users.includes(user), 'old inverses were cleared');
    });
  });

  test(`a ${state} can clear its association via null`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();

    user.commentables = null;

    assert.deepEqual(user.commentableIds, [ ]);
    assert.equal(user.commentables.models.length, 0);

    user.save();

    originalPosts.forEach(post => {
      post.reload();
      assert.notOk(post.users.includes(user), 'old inverses were cleared');
    });
  });

});
