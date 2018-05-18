import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive | association #set', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a list of saved children`, function(assert) {
      let [ tag, originalTags ] = this.helper[state]();
      let savedTag = this.helper.savedChild();

      tag.labels = [ savedTag ];

      assert.ok(tag.labels.includes(savedTag));
      assert.equal(tag.labelIds[0], savedTag.id);
      assert.ok(savedTag.labels.includes(tag), 'the inverse was set');

      tag.save();

      originalTags.forEach(originalTag => {
        originalTag.reload();
        assert.notOk(originalTag.labels.includes(tag), 'old inverses were cleared');
      });
    });

    test(`a ${state} can update its association to a new parent`, function(assert) {
      let [ tag, originalTags ] = this.helper[state]();
      let newTag = this.helper.newChild();

      tag.labels = [ newTag ];

      assert.ok(tag.labels.includes(newTag));
      assert.equal(tag.labelIds[0], undefined);
      assert.ok(newTag.labels.includes(tag), 'the inverse was set');

      tag.save();

      originalTags.forEach(originalTag => {
        originalTag.reload();
        assert.notOk(originalTag.labels.includes(tag), 'old inverses were cleared');
      });
    });

    test(`a ${state} can clear its association via an empty list`, function(assert) {
      let [ tag, originalTags ] = this.helper[state]();

      tag.labels = [ ];

      assert.deepEqual(tag.labelIds, [ ]);
      assert.equal(tag.labels.models.length, 0);

      tag.save();
      originalTags.forEach(originalTag => {
        originalTag.reload();
        assert.notOk(originalTag.labels.includes(tag), 'old inverses were cleared');
      });
    });

    test(`a ${state} can clear its association via an empty list`, function(assert) {
      let [ tag, originalTags ] = this.helper[state]();

      tag.labels = null;

      assert.deepEqual(tag.labelIds, [ ]);
      assert.equal(tag.labels.models.length, 0);

      tag.save();
      originalTags.forEach(originalTag => {
        originalTag.reload();
        assert.notOk(originalTag.labels.includes(tag), 'old inverses were cleared');
      });
    });

  });
});
