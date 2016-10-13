import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting children updates the parent's foreign key for a ${state}`, function(assert) {
    let [ tag, labels ] = this.helper[state]();

    if (labels && labels.length) {
      labels.forEach(t => t.destroy());
      tag.reload();
    }

    assert.equal(tag.labels.length, 0);
    assert.equal(tag.labelIds.length, 0);
  });

});
