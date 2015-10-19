import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../schema-helper';
import { underscore } from 'ember-cli-mirage/utils/inflector';
import {module, test} from 'qunit';

module('Integration | Serializers | JSON API Serializer | Attribute Key Formatting', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      application: JsonApiSerializer.extend({
        keyForAttribute(key) {
          return underscore(key);
        }
      })
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`keyForAttribute formats the attributes of a model`, function(assert) {
  var author = this.schema.author.create({
    id: 1,
    firstName: 'Link',
    lastName: 'Jackson',
    age: 323,
  });

  let result = this.registry.serialize(author);

  assert.deepEqual(result, {
    data: {
      type: 'authors',
      id: 1,
      attributes: {
        age: 323,
        first_name: 'Link',
        last_name: 'Jackson'
      }
    }
  });
});

test(`keyForAttribute also formats the models in a collections`, function(assert) {
  this.schema.author.create({id: 1, 'firstName': 'Link', 'lastName': 'Jackson'});
  this.schema.author.create({id: 2, 'firstName': 'Zelda', 'lastName': 'Brown'});
  let authors = this.schema.author.all();

  let result = this.registry.serialize(authors);

  assert.deepEqual(result, {
    data: [{
      type: 'authors',
      id: 1,
      attributes: {
        'first_name': 'Link',
        'last_name': 'Jackson',
      }
    }, {
      type: 'authors',
      id: 2,
      attributes: {
        'first_name': 'Zelda',
        'last_name': 'Brown',
      }
    }]
  });
});
