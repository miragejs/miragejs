import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Basic | accessor', {
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

    assert.equal(user.posts.models.length, posts.length, 'the parent has the correct number of children');
    assert.equal(user.postIds.length, posts.length, 'the parent has the correct number of children ids');

    posts.forEach((post, i) => {
      assert.deepEqual(user.posts.models[i], posts[i], 'each child is in parent.children array');

      if (post.isSaved()) {
        assert.ok(user.postIds.indexOf(post.id) > -1, 'each saved child id is in parent.childrenIds array');
      }
    });
  });

});
