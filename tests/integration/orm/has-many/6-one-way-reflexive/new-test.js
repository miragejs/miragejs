import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-Way Reflexive | new', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the parent accepts a saved child id', function(assert) {
  let tagA = this.helper.savedChild();
  let tagB = this.schema.tags.new({
    tagIds: [ tagA.id ]
  });

  assert.deepEqual(tagB.tagIds, [ tagA.id ]);
  assert.deepEqual(tagB.tags.models[0], tagA);
});

test('the parent errors if the children ids don\'t exist', function(assert) {
  assert.throws(function() {
    this.schema.tags.new({ tagIds: [ 2 ] });
  }, /You're instantiating a tag that has a tagIds of 2, but some of those records don't exist in the database/);
});

test('the parent accepts null children foreign key', function(assert) {
  let tag = this.schema.tags.new({ tagIds: null });

  assert.equal(tag.tags.models.length, 0);
  assert.deepEqual(tag.tagIds, []);
  assert.deepEqual(tag.attrs, { tagIds: null });
});

test('the parent accepts saved children', function(assert) {
  let tagA = this.helper.savedChild();
  let tagB = this.schema.tags.new({ tags: [ tagA ] });

  assert.deepEqual(tagB.tagIds, [ tagA.id ]);
  assert.deepEqual(tagB.tags.models[0], tagA);
});

test('the parent accepts new children', function(assert) {
  let tagA = this.schema.tags.new({ color: 'Red' });
  let tagB = this.schema.tags.new({ tags: [ tagA ] });

  assert.deepEqual(tagB.tagIds, [ undefined ]);
  assert.deepEqual(tagB.tags.models[0], tagA);
});

test('the parent accepts null children', function(assert) {
  let tag = this.schema.tags.new({ tags: null });

  assert.equal(tag.tags.models.length, 0);
  assert.deepEqual(tag.tagIds, []);
  assert.deepEqual(tag.attrs, { tagIds: null });
});

test('the parent accepts children and child ids', function(assert) {
  let tagA = this.helper.savedChild();
  let tagB = this.schema.tags.new({ tags: [ tagA ], tagIds: [ tagA.id ] });

  assert.deepEqual(tagB.tagIds, [ tagA.id ]);
  assert.deepEqual(tagB.tags.models[0], tagA);
});

test('the parent accepts no reference to children or child ids as empty obj', function(assert) {
  let tag = this.schema.tags.new({});

  assert.deepEqual(tag.tagIds, []);
  assert.deepEqual(tag.tags.models, []);
  assert.deepEqual(tag.attrs, { tagIds: null });
});

test('the parent accepts no reference to children or child ids', function(assert) {
  let tag = this.schema.tags.new();

  assert.deepEqual(tag.tagIds, []);
  assert.deepEqual(tag.tags.models, []);
  assert.deepEqual(tag.attrs, { tagIds: null });
});
