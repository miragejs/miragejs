import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named | association #set', {
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

    user.blogPosts = [ savedPost ];

    assert.ok(user.blogPosts.models.indexOf(savedPost) > -1);
    assert.ok(user.blogPostIds.indexOf(savedPost.id) > -1);
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let newPost = this.helper.newChild();

    user.blogPosts = [ newPost ];

    assert.deepEqual(user.blogPostIds, [ undefined ]);
    assert.deepEqual(user.blogPosts.models[0], newPost);
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user ] = this.helper[state]();

    user.blogPosts = [ ];

    assert.deepEqual(user.blogPostIds, [ ]);
    assert.equal(user.blogPosts.models.length, 0);
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user ] = this.helper[state]();

    user.blogPosts = null;

    assert.deepEqual(user.blogPostIds, [ ]);
    assert.equal(user.blogPosts.models.length, 0);
  });

});
