import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | One-Way Reflexive | instantiating', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the child accepts a saved parent id', function(assert) {
  let parent = this.helper.savedParent();
  let child = this.schema.users.new({ userId: parent.id });

  assert.equal(child.userId, parent.id);
  assert.deepEqual(child.user.attrs, parent.attrs);
  assert.deepEqual(child.attrs, { userId: parent.id });
});

test('the child errors if the parent id doesnt exist', function(assert) {
  assert.throws(function() {
    this.schema.users.new({ userId: 2 });
  }, /You're instantiating a user that has a userId of 2, but that record doesn't exist in the database/);
});

test('the child accepts a null parent id', function(assert) {
  let child = this.schema.users.new({ userId: null });

  assert.equal(child.userId, null);
  assert.deepEqual(child.user, null);
  assert.deepEqual(child.attrs, { userId: null });
});

test('the child accepts a saved parent model', function(assert) {
  let parent = this.helper.savedParent();
  let child = this.schema.users.new({ user: parent });

  assert.equal(child.userId, 1);
  assert.deepEqual(child.user.attrs, parent.attrs);
});

test('the child accepts a new parent model', function(assert) {
  let zelda = this.schema.users.new({ name: 'Zelda' });
  let child = this.schema.users.new({ user: zelda });

  assert.equal(child.userId, null);
  assert.deepEqual(child.user, zelda);
  assert.deepEqual(child.attrs, { userId: null });
});

test('the child accepts a null parent model', function(assert) {
  let child = this.schema.users.new({ user: null });

  assert.equal(child.userId, null);
  assert.deepEqual(child.user, null);
  assert.deepEqual(child.attrs, { userId: null });
});

test('the child accepts a parent model and id', function(assert) {
  let parent = this.helper.savedParent();
  let child = this.schema.users.new({ user: parent, userId: parent.id });

  assert.equal(child.userId, '1');
  assert.deepEqual(child.user.attrs, parent.attrs);
  assert.deepEqual(child.attrs, { userId: parent.id });
});

test('the child accepts no reference to a parent id or model as empty obj', function(assert) {
  let child = this.schema.users.new({});

  assert.equal(child.userId, null);
  assert.deepEqual(child.user, null);
  assert.deepEqual(child.attrs, { userId: null });
});

test('the child accepts no reference to a parent id or model', function(assert) {
  let child = this.schema.users.new();

  assert.equal(child.userId, null);
  assert.deepEqual(child.user, null);
  assert.deepEqual(child.attrs, { userId: null });
});
