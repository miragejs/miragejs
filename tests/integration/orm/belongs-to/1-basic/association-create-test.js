import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a belongs-to association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated parent`, function(assert) {
    let [ post ] = this.helper[state]();

    let ganon = post.createAuthor({ name: 'Ganon' });

    assert.ok(ganon.id, 'the parent was persisted');
    assert.deepEqual(post.author.attrs, ganon.attrs);
    assert.equal(post.authorId, ganon.id);
    assert.equal(this.helper.schema.posts.find(post.id).authorId, ganon.id, 'the child was persisted');
  });

});
