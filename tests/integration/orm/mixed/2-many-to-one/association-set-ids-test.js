import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | Many To One | association #setIds', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ post, originalUser ] = this.helper[state]();
    let user = this.helper.savedParent();

    post.userId = user.id;

    assert.equal(post.userId, user.id);
    assert.deepEqual(post.user.attrs, user.attrs);

    assert.ok(post.user.posts.includes(post), 'the inverse was set');

    post.save();
    user.reload();

    assert.ok(user.posts.includes(post));

    // Old inverses were cleared
    if (originalUser && originalUser.isSaved()) {
      originalUser.reload();
      assert.notOk(originalUser.posts.includes(post));
    }
  });

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ post, originalUser ] = this.helper[state]();

    post.userId = null;

    assert.deepEqual(post.user, null);
    assert.deepEqual(post.userId, null);

    post.save();

    if (originalUser && originalUser.isSaved()) {
      originalUser.reload();
      assert.notOk(originalUser.posts.includes(post));
    }
  });

});
