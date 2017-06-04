import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-way Polymorphic | association #setIds', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parentId, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a saved parent via parentId`, function(assert) {
    let [ user ] = this.helper[state]();
    let savedPost = this.helper.savedChild();

    user.thingIds = [ { type: 'post', id: savedPost.id } ];

    assert.ok(user.things.includes(savedPost));
    assert.ok(user.thingIds.find(({ id, type }) => ((id === savedPost.id && type === 'post'))));
  });

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ user ] = this.helper[state]();

    user.thingIds = null;

    assert.deepEqual(user.things.models, []);
    assert.deepEqual(user.thingIds, []);
  });

});
