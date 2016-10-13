import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | Many To One | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ post, originalUser ] = this.helper[state]();

    let user = post.newUser({ name: 'Zelda' });

    assert.ok(!user.id, 'the child was not persisted');
    assert.deepEqual(post.user, user, 'the relationship was set');
    assert.ok(user.posts.includes(post), 'the inverse was set');

    user.save();
    post.reload();

    assert.ok(user.id, 'the parent was persisted');
    assert.deepEqual(post.user.attrs, user.attrs);
    assert.equal(post.userId, user.id);

    // Check the inverse
    assert.ok(user.posts.includes(post), 'the inverse was set');

    // Ensure old inverse was cleared
    if (originalUser && originalUser.isSaved()) {
      originalUser.reload();
      assert.notOk(originalUser.posts.includes(post));
    }
  });

});
