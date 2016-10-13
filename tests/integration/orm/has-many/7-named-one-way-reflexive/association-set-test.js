import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named One-Way Reflexive | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a list of saved children`, function(assert) {
    let [ tag ] = this.helper[state]();
    let savedTag = this.helper.savedChild();

    tag.labels = [ savedTag ];

    assert.ok(tag.labels.includes(savedTag));
    assert.equal(tag.labelIds[0], savedTag.id);
    assert.notOk(savedTag.labels.includes(tag), 'the inverse was not set');

    tag.save();
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ tag ] = this.helper[state]();
    let newTag = this.helper.newChild();

    tag.labels = [ newTag ];

    assert.ok(tag.labels.includes(newTag));
    assert.equal(tag.labelIds[0], undefined);
    assert.notOk(newTag.labels.includes(tag), 'the inverse was not set');

    tag.save();
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ tag ] = this.helper[state]();

    tag.labels = [ ];

    assert.deepEqual(tag.labelIds, [ ]);
    assert.equal(tag.labels.models.length, 0);

    tag.save();
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ tag ] = this.helper[state]();

    tag.labels = null;

    assert.deepEqual(tag.labelIds, [ ]);
    assert.equal(tag.labels.models.length, 0);

    tag.save();
  });

});
