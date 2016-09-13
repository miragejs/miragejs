// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Model, JSONAPISerializer } from 'ember-cli-mirage';
import { underscore } from 'ember-cli-mirage/utils/inflector';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Key Formatting', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model,
      photograph: Model
    });
  }
});

test(`keyForAttribute formats the attributes of a model`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer.extend({
      keyForAttribute(key) {
        return underscore(key);
      }
    })
  });
  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    firstName: 'Link',
    lastName: 'Jackson',
    age: 323
  });

  let result = registry.serialize(wordSmith);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        age: 323,
        first_name: 'Link',
        last_name: 'Jackson'
      }
    }
  });
});

test(`keyForAttribute also formats the models in a collections`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer.extend({
      keyForAttribute(key) {
        return underscore(key);
      }
    })
  });

  this.schema.wordSmiths.create({ id: 1, 'firstName': 'Link', 'lastName': 'Jackson' });
  this.schema.wordSmiths.create({ id: 2, 'firstName': 'Zelda', 'lastName': 'Brown' });
  let wordSmiths = this.schema.wordSmiths.all();

  let result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first_name': 'Link',
        'last_name': 'Jackson'
      }
    }, {
      type: 'word-smiths',
      id: '2',
      attributes: {
        'first_name': 'Zelda',
        'last_name': 'Brown'
      }
    }]
  });
});
