import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive Explicit Inverse | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a has-many association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated child`, function(assert) {
    let [ tag ] = this.helper[state]();
    let initialCount = tag.labels.models.length;

    let orangeTag = tag.createLabel({ name: 'Orange' });

    assert.ok(orangeTag.id, 'the child was persisted');
    assert.equal(tag.labels.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(tag.labels.includes(orangeTag), 'the model was added to tag.labels');
    assert.ok(tag.labelIds.indexOf(orangeTag.id) > -1, 'the id was added to the fks array');
    assert.ok(tag.attrs.labelIds.indexOf(orangeTag.id) > -1, 'fks were persisted');
    assert.ok(orangeTag.labels.includes(tag), 'the inverse was set');
  });

});
