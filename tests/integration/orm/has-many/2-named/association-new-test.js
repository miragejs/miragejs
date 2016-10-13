import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let initialCount = user.blogPosts.models.length;

    let post = user.newBlogPost({ title: 'Lorem ipsum' });

    assert.ok(!post.id, 'the child was not persisted');
    assert.equal(user.blogPosts.models.length, initialCount + 1);

    post.save();

    assert.deepEqual(post.attrs, { id: post.id, title: 'Lorem ipsum' }, 'the child was persisted');
    assert.equal(user.blogPosts.models.length, initialCount + 1, 'the collection size was increased');
    assert.deepEqual(user.blogPosts.models.filter((a) => a.id === post.id)[0], post, 'the model was added to user.blogPosts');
    assert.ok(user.blogPostIds.indexOf(post.id) > -1, 'the id was added to the fks array');
  });

});
