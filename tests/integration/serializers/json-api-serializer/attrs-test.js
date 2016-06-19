import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import { Model, JSONAPISerializer } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Attrs List', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model,
      photograph: Model
    });
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    wordSmith: JSONAPISerializer.extend({
      attrs: ['firstName']
    })
  });
  let user = this.schema.wordSmiths.create({
    id: 1,
    firstName: 'Link',
    age: 123
  });

  let result = registry.serialize(user);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
      }
    }
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: JSONAPISerializer,
    wordSmith: JSONAPISerializer.extend({
      attrs: ['firstName']
    })
  });
  this.schema.wordSmiths.create({ id: 1, firstName: 'Link', age: 123 });
  this.schema.wordSmiths.create({ id: 2, firstName: 'Zelda', age: 456 });

  let collection = this.schema.wordSmiths.all();
  let result = registry.serialize(collection);

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
      }
    }, {
      type: 'word-smiths',
      id: '2',
      attributes: {
        'first-name': 'Zelda'
      }
    }]
  });
});

test(`it can use different attr whitelists for different serializers`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    wordSmith: JSONAPISerializer.extend({
      attrs: ['firstName']
    }),
    photograph: JSONAPISerializer.extend({
      attrs: ['title']
    })
  });

  let link = this.schema.wordSmiths.create({ id: 1, firstName: 'Link', age: 123 });
  assert.deepEqual(registry.serialize(link), {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link'
      }
    }
  });

  let photo = this.schema.photographs.create({ id: 1, title: 'Lorem ipsum', createdAt: '2010-01-01' });
  assert.deepEqual(registry.serialize(photo), {
    data: {
      type: 'photographs',
      id: '1',
      attributes: {
        'title': 'Lorem ipsum'
      }
    }
  });
});
