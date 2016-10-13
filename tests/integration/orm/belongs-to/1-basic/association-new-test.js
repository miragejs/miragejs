import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Basic | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated parent`, function(assert) {
    let [ post ] = this.helper[state]();

    let ganon = post.newAuthor({ name: 'Ganon' });

    assert.ok(!ganon.id, 'the parent was not persisted');
    assert.deepEqual(post.author, ganon);
    assert.equal(post.authorId, null);

    post.save();

    assert.ok(ganon.id, 'saving the child persists the parent');
    assert.equal(post.authorId, ganon.id, 'the childs fk was updated');
  });

});
