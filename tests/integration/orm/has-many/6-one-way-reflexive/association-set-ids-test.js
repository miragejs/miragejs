import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-Way Reflexive | association #setIds', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`a ${state} can update its association to include a saved child via childIds`, function(assert) {
    let [ tag ] = this.helper[state]();
    let savedTag = this.helper.savedChild();

    tag.tagIds = [ savedTag.id ];

    assert.deepEqual(tag.tags.models[0].attrs, savedTag.attrs);
    assert.deepEqual(tag.tagIds, [ savedTag.id ]);

    tag.save();
    savedTag.reload();

    assert.equal(savedTag.tags.models.length, 0, 'the inverse was not set');
  });

  test(`a ${state} can clear its association via a null childIds`, function(assert) {
    let [ tag ] = this.helper[state]();

    tag.tagIds = null;

    assert.deepEqual(tag.tags.models, []);
    assert.deepEqual(tag.tagIds, []);

    tag.save();
  });

});
