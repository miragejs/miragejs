import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - root:true', {
  beforeEach() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      post: Serializer.extend({
        root: true
      })
    });
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`if root is true, it serializes a model by returning its attrs under a key of the model's type`, function(assert) {
  var post = schemaHelper.getModel('post', {
    id: 1,
    title: 'Lorem ipsum',
  });

  var result = this.registry.serialize(post);
  assert.deepEqual(result, {
    post: {
      id: 1,
      title: 'Lorem ipsum',
    }
  });
});

test(`if root is true, it serializes a collection of models by returning an array of their attrs under a pluralized key`, function(assert) {
  var collection = schemaHelper.getCollection('post', [
    {id: 1, title: 'Lorem'},
    {id: 2, title: 'Ipsum'}
  ]);

  var result = this.registry.serialize(collection);
  assert.deepEqual(result, {
    posts: [
      {id: 1, title: 'Lorem'},
      {id: 2, title: 'Ipsum'}
    ]
  });
});
