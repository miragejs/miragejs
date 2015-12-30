import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Attrs List', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      wordSmith: JsonApiSerializer.extend({
        attrs: ['id', 'firstName']
      })
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  var user = this.schema.wordSmith.create({
    id: 1,
    firstName: 'Link',
    age: 123,
  });

  var result = this.registry.serialize(user);
  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
      },
      relationships: {
        "blog-posts": {
          data: []
        }
      }
    }
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  let schema = this.schema;
  schema.wordSmith.create({id: 1, firstName: 'Link', age: 123});
  schema.wordSmith.create({id: 2, firstName: 'Zelda', age: 456});

  let collection = this.schema.wordSmith.all();
  let result = this.registry.serialize(collection);

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
      },
      relationships: {
        "blog-posts": {
          data: []
        }
      }
    }, {
      type: 'word-smiths',
      id: '2',
        attributes: {
        'first-name': 'Zelda'
      },
      relationships: {
        "blog-posts": {
          data: []
        }
      }
    }]
  });
});
