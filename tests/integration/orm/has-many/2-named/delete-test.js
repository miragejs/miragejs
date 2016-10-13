import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting children updates the parent's foreign key for a ${state}`, function(assert) {
    let [ user, blogPosts ] = this.helper[state]();

    if (blogPosts && blogPosts.length) {
      blogPosts.forEach(p => p.destroy());
      user.reload();
    }

    assert.equal(user.blogPosts.length, 0);
    assert.equal(user.blogPostIds.length, 0);
  });

});
