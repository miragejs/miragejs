import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Basic | association #setIds', {
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

    user.postIds = [ savedPost.id ];

    assert.deepEqual(user.posts.models[0].attrs, savedPost.attrs);
    assert.deepEqual(user.postIds, [ savedPost.id ]);
  });

  test(`a ${state} can clear its association via a null parentId`, function(assert) {
    let [ user ] = this.helper[state]();

    user.postIds = null;

    assert.deepEqual(user.posts.models, []);
    assert.deepEqual(user.postIds, []);
  });

});
