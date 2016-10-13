import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | association #setId', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ post ] = this.helper[state]();
    let savedAuthor = this.helper.savedParent();

    post.authorId = savedAuthor.id;

    assert.equal(post.authorId, savedAuthor.id);
    assert.deepEqual(post.author.attrs, savedAuthor.attrs);
  });

});

[
  'savedChildSavedParent',
  'newChildSavedParent'
].forEach((state) => {

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ post ] = this.helper[state]();

    post.authorId = null;

    assert.equal(post.authorId, null);
    assert.deepEqual(post.author, null);
  });

});
