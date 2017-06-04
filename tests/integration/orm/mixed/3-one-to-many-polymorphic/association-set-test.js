import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many Polymorphic | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a list of saved children`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();
    let savedPost = this.helper.savedChild();

    user.things = [ savedPost ];

    assert.ok(user.things.includes(savedPost));
    assert.ok(user.thingIds.find(({ id, type }) => ((id === savedPost.id && type === 'post'))));

    user.save();

    originalPosts.forEach(post => {
      if (post.isSaved()) {
        post.reload();
        assert.equal(post.user, null);
      }
    });
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();
    let newPost = this.helper.newChild();

    user.things = [ newPost ];

    assert.deepEqual(user.thingIds, [ { type: 'post', id: undefined } ]);
    assert.ok(user.things.includes(newPost));

    user.save();

    originalPosts.forEach(post => {
      if (post.isSaved()) {
        post.reload();
        assert.equal(post.user, null);
      }
    });
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();

    user.things = [ ];

    assert.deepEqual(user.thingIds, [ ]);
    assert.equal(user.things.models.length, 0);

    user.save();

    originalPosts.forEach(post => {
      if (post.isSaved()) {
        post.reload();
        assert.equal(post.user, null);
      }
    });
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user, originalPosts ] = this.helper[state]();

    user.things = null;

    assert.deepEqual(user.thingIds, [ ]);
    assert.equal(user.things.models.length, 0);

    user.save();

    originalPosts.forEach(post => {
      if (post.isSaved()) {
        post.reload();
        assert.equal(post.user, null);
      }
    });
  });

});
