import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { camelize } from 'ember-cli-mirage/utils/inflector';
import {module, test} from 'qunit';

schemaHelper.setup();

module('mirage:serializer - attribute key formatting', {
  beforeEach() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      author: Serializer.extend({
        keyForAttribute(key) {
          return camelize(key);
        }
      })
    });
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`keyForAttribute formats the attributes of a model`, function(assert) {
  var author = schemaHelper.getModel('author', {
    id: 1,
    'first-name': 'Link',
    'last-name': 'Jackson',
    age: 323,
  });

  let result = this.registry.serialize(author);

  assert.deepEqual(result, {
    author: {
      id: 1,
      firstName: 'Link',
      lastName: 'Jackson',
      age: 323
    }
  });
});

test(`keyForAttribute also formats the models in a collections`, function(assert) {
  var author = schemaHelper.getCollection('author', [
    {id: 1, 'first-name': 'Link', 'last-name': 'Jackson'},
    {id: 2, 'first-name': 'Zelda', 'last-name': 'Brown'}
  ]);

  let result = this.registry.serialize(author);

  assert.deepEqual(result, {
    authors: [
      {id: 1, firstName: 'Link', lastName: 'Jackson'},
      {id: 2, firstName: 'Zelda', lastName: 'Brown'}
    ]
  });
});
