import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-way Polymorphic | association #new', {
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
    let initialCount = user.things.models.length;

    let post = user.newThing('post', { title: 'Lorem ipsum' });

    assert.ok(!post.id, 'the child was not persisted');
    assert.equal(user.things.models.length, initialCount + 1);

    post.save();

    assert.deepEqual(post.attrs, { id: post.id, title: 'Lorem ipsum' }, 'the child was persisted');
    assert.equal(user.things.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(user.things.includes(post), 'the model was added to user.things');
    assert.ok(user.thingIds.find(obj => {
      return (obj.id === post.id && obj.type === 'post');
    }), 'the id was added to the fks array');
  });

});
