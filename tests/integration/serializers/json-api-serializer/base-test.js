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
  var user = this.schema.author.create({
    id: 1,
    firstName: 'Link',
    age: 123,
  });

  var result = this.registry.serialize(user);
  assert.deepEqual(result, {
    data: {
      type: 'authors',
      id: 1,
      attributes: {
        'first-name': 'Link',
        age: 123
      }
    }
  });
});

test(`it inclues all attributes for each model in a collection`, function(assert) {
  let schema = this.schema;
  schema.author.create({id: 1, firstName: 'Link', age: 123});
  schema.author.create({id: 2, firstName: 'Zelda', age: 456});

  let collection = this.schema.author.all();
  let result = this.registry.serialize(collection);

  assert.deepEqual(result, {
    data: [{
      type: 'authors',
      id: 1,
      attributes: {
        'first-name': 'Link',
        age: 123
      }
    }, {
      type: 'authors',
      id: 2,
      attributes: {
        'first-name': 'Zelda',
        age: 456
      }
    }]
  });
});

test(`it can serialize an empty collection`, function(assert) {
  var authors = this.schema.author.all();
  var result = this.registry.serialize(authors);

  assert.deepEqual(result, {
    data: []
  });
});
