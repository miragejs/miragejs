import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-way Polymorphic | association #set', {
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

    user.things = [ savedPost ];

    assert.ok(user.things.models.includes(savedPost));
    assert.ok(user.thingIds.find(({ id, type }) => ((id === savedPost.id && type === 'post'))));
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ user ] = this.helper[state]();
    let newPost = this.helper.newChild();

    user.things = [ newPost ];

    assert.deepEqual(user.thingIds, [ { type: 'post', id: undefined } ]);
    assert.deepEqual(user.things.models[0], newPost);
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ user ] = this.helper[state]();

    user.things = [ ];

    assert.deepEqual(user.thingIds, [ ]);
    assert.equal(user.things.models.length, 0);
  });

  test(`a ${state} can clear its association via null`, function(assert) {
    let [ user ] = this.helper[state]();

    user.things = null;

    assert.deepEqual(user.thingIds, [ ]);
    assert.equal(user.things.models.length, 0);
  });

});
