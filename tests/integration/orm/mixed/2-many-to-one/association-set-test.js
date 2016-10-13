import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | Many To One | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent`, function(assert) {
    let [ post, originalUser ] = this.helper[state]();
    let savedUser = this.helper.savedParent();

    post.user = savedUser;

    assert.deepEqual(post.user, savedUser);
    assert.ok(savedUser.posts.includes(post), 'the inverse was set');

    post.save();

    // Old inverse was cleared
    if (originalUser && originalUser.isSaved()) {
      originalUser.reload();
      assert.notOk(originalUser.posts.includes(post));
    }
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ post, originalUser ] = this.helper[state]();
    let newUser = this.helper.newParent();

    post.user = newUser;

    assert.deepEqual(post.user, newUser);
    assert.ok(newUser.posts.includes(post), 'the inverse was set');

    post.save();

    // Old inverse was cleared
    if (originalUser && originalUser.isSaved()) {
      originalUser.reload();
      assert.notOk(originalUser.posts.includes(post));
    }
  });

  test(`a ${state} can update its association to a null parent`, function(assert) {
    let [ post, originalUser ] = this.helper[state]();

    post.user = null;

    assert.deepEqual(post.user, null);

    post.save();

    // Old inverse was cleared
    if (originalUser && originalUser.isSaved()) {
      originalUser.reload();
      assert.notOk(originalUser.posts.includes(post));
    }
  });

});
