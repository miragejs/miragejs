import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Base', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      application: JsonApiSerializer
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it includes all attributes for a model`, function(assert) {
  let user = this.schema.wordSmith.create({
    id: 1,
    firstName: 'Link',
    age: 123,
  });

  let result = this.registry.serialize(user);
  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link',
        age: 123
      },
      relationships: {
        "blog-posts": {
          data: []
        }
      }
    }
  });
});

test(`it includes all attributes for each model in a collection`, function(assert) {
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
        'first-name': 'Link',
        age: 123
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
        'first-name': 'Zelda',
        age: 456
      },
      relationships: {
        "blog-posts": {
          data: []
        }
      }
    }]
  });
});

test(`it can serialize an empty collection`, function(assert) {
  let wordSmiths = this.schema.wordSmith.all();
  let result = this.registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    data: []
  });
});
