import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named One-Way Reflexive | association #setIds', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`a ${state} can update its association to include a saved child via childIds`, function(assert) {
    let [ tag ] = this.helper[state]();
    let savedTag = this.helper.savedChild();

    tag.labelIds = [ savedTag.id ];

    assert.deepEqual(tag.labels.models[0].attrs, savedTag.attrs);
    assert.deepEqual(tag.labelIds, [ savedTag.id ]);

    tag.save();
    savedTag.reload();

    assert.equal(savedTag.labels.models.length, 0, 'the inverse was not set');
  });

  test(`a ${state} can clear its association via a null childIds`, function(assert) {
    let [ tag ] = this.helper[state]();

    tag.labelIds = null;

    assert.deepEqual(tag.labels.models, []);
    assert.deepEqual(tag.labelIds, []);

    tag.save();
  });

});
