import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - attrs list', {
  beforeEach: function() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      author: Serializer.extend({
        attrs: ['id', 'name']
      })
    });
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  var user = schemaHelper.schema.author.create({
    id: 1,
    name: 'Link',
    age: 123,
  });

  var result = this.registry.serialize(user);
  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link'
    }
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  let schema = schemaHelper.schema;
  schema.author.create({id: 1, name: 'Link', age: 123});
  schema.author.create({id: 2, name: 'Zelda', age: 456});

  let collection = schemaHelper.schema.author.all();
  let result = this.registry.serialize(collection);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });
});
