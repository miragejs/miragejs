import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated child`, function(assert) {
    let [ tag ] = this.helper[state]();
    let initialCount = tag.labels.models.length;

    let blueTag = tag.newLabel({ name: 'Blue' });

    assert.ok(!blueTag.id, 'the child was not persisted');
    assert.equal(tag.labels.models.length, initialCount + 1);
    assert.equal(blueTag.labels.models.length, 1, 'the inverse was set');

    blueTag.save();

    assert.deepEqual(blueTag.attrs, { id: blueTag.id, name: 'Blue', labelIds: [ tag.id ] }, 'the child was persisted');
    assert.equal(tag.labels.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(tag.labels.includes(blueTag), 'the model was added to tag.labels');
    assert.ok(tag.labelIds.indexOf(blueTag.id) > -1, 'the id was added to the fks array');
    assert.ok(blueTag.labels.includes(tag), 'the inverse was set');
  });

});
