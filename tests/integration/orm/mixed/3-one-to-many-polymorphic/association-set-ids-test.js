import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many Polymorphic | association #setIds', {
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

    user.thingIds = [ { type: 'post', id: savedPost.id } ];

    assert.ok(user.things.includes(savedPost));
    assert.deepEqual(user.thingIds, [ { type: 'post', id: savedPost.id } ]);

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

    user.thingIds = null;

    assert.deepEqual(user.things.models, []);
    assert.deepEqual(user.thingIds, []);

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
