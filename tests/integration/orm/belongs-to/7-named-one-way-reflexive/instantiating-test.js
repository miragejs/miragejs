import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let parent = this.helper.savedParent();
  let child = this.schema.users.new({ parentId: parent.id });

  assert.equal(child.parentId, parent.id);
  assert.deepEqual(child.parent.attrs, parent.attrs);
  assert.deepEqual(child.attrs, { parentId: parent.id });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.users.new({ parentId: 2 });
  }, /You're instantiating a user that has a parentId of 2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let child = this.schema.users.new({ parentId: null });

  assert.equal(child.parentId, null);
  assert.deepEqual(child.parent, null);
  assert.deepEqual(child.attrs, { parentId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let parent = this.helper.savedParent();
  let child = this.schema.users.new({ parent });

  assert.equal(child.parentId, 1);
  assert.deepEqual(child.parent.attrs, parent.attrs);
});

test('the child accepts a new parent model', function(assert) {
  let zelda = this.schema.users.new({ name: 'Zelda' });
  let child = this.schema.users.new({ parent: zelda });

  assert.equal(child.parentId, null);
  assert.deepEqual(child.parent, zelda);
  assert.deepEqual(child.attrs, { parentId: null });
});

test('the child accepts a null parent model', function(assert) {
  let child = this.schema.users.new({ parent: null });

  assert.equal(child.parentId, null);
  assert.deepEqual(child.parent, null);
  assert.deepEqual(child.attrs, { parentId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let parent = this.helper.savedParent();
  let child = this.schema.users.new({ parent, parentId: parent.id });

  assert.equal(child.parentId, '1');
  assert.deepEqual(child.parent.attrs, parent.attrs);
  assert.deepEqual(child.attrs, { parentId: parent.id });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let child = this.schema.users.new({});

  assert.equal(child.parentId, null);
  assert.deepEqual(child.parent, null);
  assert.deepEqual(child.attrs, { parentId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let child = this.schema.users.new();

  assert.equal(child.parentId, null);
  assert.deepEqual(child.parent, null);
  assert.deepEqual(child.attrs, { parentId: null });
});
