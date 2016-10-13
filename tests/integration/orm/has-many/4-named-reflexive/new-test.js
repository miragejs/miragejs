import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive | new', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the parent accepts a saved child id', function(assert) {
  let tagA = this.helper.savedChild();
  let tagB = this.schema.tags.new({
    labelIds: [ tagA.id ]
  });

  assert.deepEqual(tagB.labelIds, [ tagA.id ]);
  assert.deepEqual(tagB.labels.models[0], tagA);
});

test('the parent errors if the children ids don\'t exist', function(assert) {
  assert.throws(function() {
    this.schema.tags.new({ labelIds: [ 2 ] });
  }, /You're instantiating a tag that has a labelIds of 2, but some of those records don't exist in the database/);
});

test('the parent accepts null children foreign key', function(assert) {
  let tag = this.schema.tags.new({ labelIds: null });

  assert.equal(tag.labels.models.length, 0);
  assert.deepEqual(tag.labelIds, []);
  assert.deepEqual(tag.attrs, { labelIds: null });
});

test('the parent accepts saved children', function(assert) {
  let tagA = this.helper.savedChild();
  let tagB = this.schema.tags.new({ labels: [ tagA ] });

  assert.deepEqual(tagB.labelIds, [ tagA.id ]);
  assert.deepEqual(tagB.labels.models[0], tagA);
});

test('the parent accepts new children', function(assert) {
  let tagA = this.schema.tags.new({ color: 'Red' });
  let tagB = this.schema.tags.new({ labels: [ tagA ] });

  assert.deepEqual(tagB.labelIds, [ undefined ]);
  assert.deepEqual(tagB.labels.models[0], tagA);
});

test('the parent accepts null children', function(assert) {
  let tag = this.schema.tags.new({ labels: null });

  assert.equal(tag.labels.models.length, 0);
  assert.deepEqual(tag.labelIds, []);
  assert.deepEqual(tag.attrs, { labelIds: null });
});

test('the parent accepts children and child ids', function(assert) {
  let tagA = this.helper.savedChild();
  let tagB = this.schema.tags.new({ labels: [ tagA ], labelIds: [ tagA.id ] });

  assert.deepEqual(tagB.labelIds, [ tagA.id ]);
  assert.deepEqual(tagB.labels.models[0], tagA);
});

test('the parent accepts no reference to children or child ids as empty obj', function(assert) {
  let tag = this.schema.tags.new({});

  assert.deepEqual(tag.labelIds, []);
  assert.deepEqual(tag.labels.models, []);
  assert.deepEqual(tag.attrs, { labelIds: null });
});

test('the parent accepts no reference to children or child ids', function(assert) {
  let tag = this.schema.tags.new();

  assert.deepEqual(tag.labelIds, []);
  assert.deepEqual(tag.labels.models, []);
  assert.deepEqual(tag.attrs, { labelIds: null });
});
