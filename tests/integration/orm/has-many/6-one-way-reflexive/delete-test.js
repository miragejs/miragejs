import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-Way Reflexive | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting children updates the parent's foreign key for a ${state}`, function(assert) {
    let [ tag, tags ] = this.helper[state]();

    if (tags && tags.length) {
      tags.forEach(t => t.destroy());
      tag.reload();
    }

    assert.equal(tag.tags.length, 0);
    assert.equal(tag.tagIds.length, 0);
  });

});
