import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { Model, belongsTo } from 'ember-cli-mirage';
import {module, test} from 'qunit';

module('Unit | Schema', function() {
  test('it can be instantiated', function(assert) {
    let dbMock = {};
    let schema = new Schema(dbMock);
    assert.ok(schema);
  });

  test('it cannot be instantiated without a db', function(assert) {
    assert.throws(function() {
      new Schema();
    }, /requires a db/);
  });

  test('modelFor returns model for given type if registered', function(assert) {
    let db = new Db();
    let schema = new Schema(db);

    assert.equal(schema.modelFor('article'), null);

    let authorModel = Model.extend({
    });
    let articleModel = Model.extend({
      author: belongsTo()
    });
    schema.registerModel('article', articleModel);
    schema.registerModel('author', authorModel);

    assert.deepEqual(schema.modelFor('article').foreignKeys, ['authorId']);
    assert.deepEqual(schema.modelFor('author').foreignKeys, []);
  });

  test('`first()` returns null when nothing is found', function(assert) {
    assert.expect(2);

    let db = new Db();
    let schema = new Schema(db);

    let authorModel = Model.extend({});
    schema.registerModel('author', authorModel);

    assert.equal(schema.first('author'), null);

    let record = schema.create('author', { id: 1, name: 'Mary Roach' });

    assert.deepEqual(schema.first('author'), record);
  });

  test('`findBy()` returns null when nothing is found', function(assert) {
    assert.expect(3);

    let db = new Db();
    let schema = new Schema(db);

    let authorModel = Model.extend({});
    schema.registerModel('author', authorModel);

    assert.deepEqual(schema.findBy('author', { name: 'Mary Roach' }), null);

    let record = schema.create('author', { id: 1, name: 'Mary Roach' });

    assert.deepEqual(schema.findBy('author', { name: 'Mary Roach' }), record);
    assert.equal(schema.findBy('author', { name: 'Charles Dickens' }), null);
  });
});
