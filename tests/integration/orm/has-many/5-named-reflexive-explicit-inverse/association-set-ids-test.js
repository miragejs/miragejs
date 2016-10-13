import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive Explicit Inverse | association #setIds', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`a ${state} can update its association to include a saved child via childIds`, function(assert) {
    let [ tag, originalTags ] = this.helper[state]();
    let savedTag = this.helper.savedChild();

    tag.labelIds = [ savedTag.id ];

    assert.deepEqual(tag.labels.models[0].attrs, savedTag.attrs);
    assert.deepEqual(tag.labelIds, [ savedTag.id ]);

    tag.save();
    savedTag.reload();

    assert.deepEqual(savedTag.labels.models[0].attrs, tag.attrs, 'the inverse was set');
    originalTags.forEach(originalTag => {
      if (originalTag.isSaved()) {
        originalTag.reload();
        assert.notOk(originalTag.labels.includes(tag), 'old inverses were cleared');
      }
    });
  });

  test(`a ${state} can clear its association via a null childIds`, function(assert) {
    let [ tag, originalTags ] = this.helper[state]();

    tag.labelIds = null;

    assert.deepEqual(tag.labels.models, []);
    assert.deepEqual(tag.labelIds, []);

    tag.save();
    originalTags.forEach(originalTag => {
      originalTag.reload();
      assert.notOk(originalTag.labels.includes(tag), 'old inverses were cleared');
    });
  });

});
