import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Reflexive | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a list of saved children`, function(assert) {
    let [ tag, originalTags ] = this.helper[state]();
    let savedTag = this.helper.savedChild();

    tag.tags = [ savedTag ];

    assert.ok(tag.tags.includes(savedTag));
    assert.equal(tag.tagIds[0], savedTag.id);
    assert.ok(savedTag.tags.includes(tag), 'the inverse was set');

    tag.save();

    originalTags.forEach(originalTag => {
      originalTag.reload();
      assert.notOk(originalTag.tags.includes(tag), 'old inverses were cleared');
    });
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ tag, originalTags ] = this.helper[state]();
    let newTag = this.helper.newChild();

    tag.tags = [ newTag ];

    assert.ok(tag.tags.includes(newTag));
    assert.equal(tag.tagIds[0], undefined);
    assert.ok(newTag.tags.includes(tag), 'the inverse was set');

    tag.save();

    originalTags.forEach(originalTag => {
      originalTag.reload();
      assert.notOk(originalTag.tags.includes(tag), 'old inverses were cleared');
    });
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ tag, originalTags ] = this.helper[state]();

    tag.tags = [ ];

    assert.deepEqual(tag.tagIds, [ ]);
    assert.equal(tag.tags.models.length, 0);

    tag.save();
    originalTags.forEach(originalTag => {
      originalTag.reload();
      assert.notOk(originalTag.tags.includes(tag), 'old inverses were cleared');
    });
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ tag, originalTags ] = this.helper[state]();

    tag.tags = null;

    assert.deepEqual(tag.tagIds, [ ]);
    assert.equal(tag.tags.models.length, 0);

    tag.save();
    originalTags.forEach(originalTag => {
      originalTag.reload();
      assert.notOk(originalTag.tags.includes(tag), 'old inverses were cleared');
    });
  });

});
