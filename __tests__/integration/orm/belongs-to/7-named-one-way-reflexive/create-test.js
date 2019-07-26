import Helper from './_helper';
import { Model } from '@miragejs/server';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Named One-Way Reflexive | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', function(assert) {
    let { schema } = this.helper;
    let parent = schema.create('user');
    let child = schema.create('user', {
      parentId: parent.id
    });

    assert.equal(child.parentId, parent.id);
    assert.deepEqual(child.parent.attrs, parent.attrs);
    assert.equal(schema.db.users.length, 2);
    assert.deepEqual(schema.db.users[0], { id: '1', parentId: null });
    assert.deepEqual(schema.db.users[1], { id: '2', parentId: '1' });
  });

  test('it sets up associations correctly when passing in the association itself', function(assert) {
    let { schema } = this.helper;
    let parent = schema.create('user');
    let child = schema.create('user', {
      parent
    });

    assert.equal(child.parentId, parent.id);
    assert.deepEqual(child.parent.attrs, parent.attrs);
    assert.equal(schema.db.users.length, 2);
    assert.deepEqual(schema.db.users[0], { id: '1', parentId: null });
    assert.deepEqual(schema.db.users[1], { id: '2', parentId: '1' });
  });

  test('it throws an error if a model is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.create('user', {
        foo: schema.create('foo')
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;
    schema.create('foo');
    schema.create('foo');

    assert.throws(function() {
      schema.create('user', {
        foos: schema.foos.all()
      });
    }, /you haven't defined that key as an association on your model/);
  });
});
