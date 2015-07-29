import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - attrs list', {
  beforeEach: function() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      post: Serializer.extend({
        attrs: ['id', 'title']
      })
    });
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  var user = schemaHelper.getModel('post', {
    id: 1,
    title: 'Lorem',
    date: '20150101',
  });

  var result = this.registry.serialize(user);
  assert.deepEqual(result, {
    id: 1,
    title: 'Lorem'
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  var collection = schemaHelper.getCollection('post', [
    {id: 1, title: 'Lorem', date: '20150101'},
    {id: 2, title: 'Ipsum', date: '20150102'}
  ]);

  var result = this.registry.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, title: 'Lorem'},
    {id: 2, title: 'Ipsum'}
  ]);
});
