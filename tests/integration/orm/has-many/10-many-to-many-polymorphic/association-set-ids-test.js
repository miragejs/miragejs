import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many-to-many Polymorphic | association #setIds', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();
    let savedPost = this.helper.savedChild();

    user.commentableIds = [ { type: 'post', id: savedPost.id } ];

    assert.ok(user.commentables.includes(savedPost));
    assert.ok(user.commentableIds.find(({ id, type }) => ((id === savedPost.id && type === 'post'))));

    user.save();
    savedPost.reload();

    assert.ok(savedPost.users.includes(user), 'the inverse was set');
    originalPosts.forEach(post => {
      if (post.isSaved()) {
        post.reload();
        assert.notOk(post.users.includes(user), 'old inverses were cleared');
      }
    });
  });

  test(`a ${state} can clear its association via a null ids`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();

    user.commentableIds = null;

    assert.deepEqual(user.commentables.models, []);
    assert.deepEqual(user.commentableIds, []);

    user.save();

    originalPosts.forEach(post => {
      post.reload();
      assert.notOk(post.users.includes(user), 'old inverses were cleared');
    });
  });

});
