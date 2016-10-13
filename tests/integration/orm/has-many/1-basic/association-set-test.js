import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Basic | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a list of saved children`, function(assert) {
    let [ user ] = this.helper[state]();
    let savedPost = this.helper.savedChild();

    user.posts = [ savedPost ];

    assert.ok(user.posts.models.indexOf(savedPost) > -1);
    assert.ok(user.postIds.indexOf(savedPost.id) > -1);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let newPost = this.helper.newChild();

    user.posts = [ newPost ];

    assert.deepEqual(user.postIds, [ undefined ]);
    assert.deepEqual(user.posts.models[0], newPost);
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user ] = this.helper[state]();

    user.posts = [ ];

    assert.deepEqual(user.postIds, [ ]);
    assert.equal(user.posts.models.length, 0);
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user ] = this.helper[state]();

    user.posts = null;

    assert.deepEqual(user.postIds, [ ]);
    assert.equal(user.posts.models.length, 0);
  });

});
