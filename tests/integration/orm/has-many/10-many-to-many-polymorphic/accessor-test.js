import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many-to-many Polymorphic | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The reference to a belongs-to association is correct, for all states
*/
states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ user, posts ] = this.helper[state]();

    assert.equal(user.commentables.models.length, posts.length, 'the parent has the correct number of children');
    assert.equal(user.commentableIds.length, posts.length, 'the parent has the correct number of children ids');

    posts.forEach((post, i) => {
      assert.ok(user.commentables.includes(post), 'each child is in parent.children array');

      if (post.isSaved()) {
        assert.deepEqual(
          user.commentableIds[i],
          { type: 'post', id: post.id },
          'each saved child id is in parent.childrenIds array'
        );
      }

      // Check the inverse
      assert.ok(post.users.includes(user));
    });
  });

});
