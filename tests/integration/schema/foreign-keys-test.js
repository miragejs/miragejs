import { module, test } from 'qunit';
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import { hasMany, belongsTo } from 'ember-cli-mirage';

module('Integration | Schema | Foreign keys test');

test('schemas with a single hasMany have correct foreign keys', function(assert) {
  var schema = new Schema(new Db(), {
    user: Model.extend({
      projects: hasMany(),
    }),
    project: Model
  });

  assert.deepEqual(schema._registry.user.foreignKeys, []);
  assert.deepEqual(schema._registry.project.foreignKeys, ['userId']);
});

test('schemas with a single belongsTo have correct foreign keys', function(assert) {
  var schema = new Schema(new Db(), {
    user: Model,
    project: Model.extend({
      user: belongsTo()
    })
  });

  assert.deepEqual(schema._registry.user.foreignKeys, []);
  assert.deepEqual(schema._registry.project.foreignKeys, ['userId']);
});

test('schemas with a single hasMany and belongsTo have correct foreign keys', function(assert) {
  var schema = new Schema(new Db(), {
    user: Model.extend({
      projects: hasMany()
    }),
    project: Model.extend({
      user: belongsTo()
    })
  });

  assert.deepEqual(schema._registry.user.foreignKeys, []);
  assert.deepEqual(schema._registry.project.foreignKeys, ['userId']);
});

test('complex schemas have correct foreign keys', function(assert) {
  var schema = new Schema(new Db(), {
    user: Model.extend({
      projects: hasMany(),
      tasks: hasMany()
    }),
    project: Model.extend({
      user: belongsTo(),
      tasks: hasMany()
    }),
    task: Model.extend({
      user: belongsTo(),
      project: belongsTo(),
    })
  });

  assert.deepEqual(schema._registry.user.foreignKeys, []);
  assert.deepEqual(schema._registry.project.foreignKeys, ['userId']);
  assert.deepEqual(schema._registry.task.foreignKeys, ['userId', 'projectId']);
});
