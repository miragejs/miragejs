import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The reference to a belongs-to association is correct, for all states
*/
states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ post, author ] = this.helper[state]();

    assert.deepEqual(post.author, author ? author : null, 'the model reference is correct');
    assert.equal(post.authorId, author ? author.id : null, 'the modelId reference is correct');
  });

});
