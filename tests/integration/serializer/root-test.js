import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - root:true', {
  beforeEach() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      author: Serializer.extend({
        root: true
      })
    });
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`if root is true, it serializes a model by returning its attrs under a key of the model's type`, function(assert) {
  var author = schemaHelper.getModel('author', {
    id: 1,
    name: 'Link',
  });

  var result = this.registry.serialize(author);
  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
    }
  });
});

test(`if root is true, it serializes a collection of models by returning an array of their attrs under a pluralized key`, function(assert) {
  var collection = schemaHelper.getCollection('author', [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ]);

  var result = this.registry.serialize(collection);
  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });
});
