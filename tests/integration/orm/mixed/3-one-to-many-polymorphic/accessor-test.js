import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many Polymorphic | accessor', {
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

    assert.equal(user.things.models.length, posts.length, 'the parent has the correct number of children');
    assert.equal(user.thingIds.length, posts.length, 'the parent has the correct number of children ids');

    posts.forEach((post, i) => {
      assert.deepEqual(user.things.models[i], posts[i], 'each child is in parent.children array');

      if (post.isSaved()) {
        assert.ok(user.thingIds.find(obj => {
          return (obj.id === post.id && obj.type === 'post');
        }), 'each saved child id is in parent.childrenIds array');
      }

      // Check the inverse
      assert.deepEqual(post.user.attrs, user.attrs);
      assert.deepEqual(post.userId, user.id);
    });
  });

});
