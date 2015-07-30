import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - Base', {
  beforeEach() {
    this.registry = new SerializerRegistry(schemaHelper.schema);
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test('it returns objects unaffected', function(assert) {
  var result = this.registry.serialize({oh: 'hai'});

  assert.deepEqual(result, {oh: 'hai'});
});

test('it returns arrays unaffected', function(assert) {
  var data = [{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}];
  var result = this.registry.serialize(data);

  assert.deepEqual(result, data);
});

test(`it serializes a model by returning its attrs`, function(assert) {
  var author = schemaHelper.getModel('author', {
    id: 1,
    name: 'Link',
  });

  var result = this.registry.serialize(author);
  assert.deepEqual(result, {
    id: 1,
    name: 'Link',
  });
});

test(`it serializes a collection of models by returning an array of their attrs`, function(assert) {
  var collection = schemaHelper.getCollection('author', [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ]);

  var result = this.registry.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ]);
});
