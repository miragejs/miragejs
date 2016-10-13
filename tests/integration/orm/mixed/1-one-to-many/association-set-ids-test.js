import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many | association #setIds', {
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

    user.postIds = [ savedPost.id ];

    assert.ok(user.posts.includes(savedPost));
    assert.deepEqual(user.postIds, [ savedPost.id ]);

    user.save();
    savedPost.reload();

    // Check the inverse
    assert.deepEqual(savedPost.user.attrs, user.attrs);
    assert.equal(savedPost.userId, user.id);

    // Check old associates
    originalPosts.forEach(post => {
      if (post.isSaved()) {
        post.reload();
        assert.equal(post.user, null);
      }
    });
  });

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();

    user.postIds = null;

    assert.deepEqual(user.posts.models, []);
    assert.deepEqual(user.postIds, []);

    user.save();

    // Check old associates
    originalPosts.forEach(post => {
      if (post.isSaved()) {
        post.reload();
        assert.equal(post.user, null);
      }
    });
  });

});
