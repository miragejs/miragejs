import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | Many To One | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a has-many association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated parent`, function(assert) {
    let [ post, originalUser ] = this.helper[state]();

    let user = post.createUser({ name: 'Zelda' });

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
