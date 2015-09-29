import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from '../schema-helper';
import { camelize } from 'ember-cli-mirage/utils/inflector';
import {module, test} from 'qunit';

module('Integration | Serializers | Base | Attribute Key Formatting', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      author: Serializer.extend({
        keyForAttribute(key) {
          return camelize(key);
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
  this.schema.author.create({id: 1, 'first-name': 'Link', 'last-name': 'Jackson'});
  this.schema.author.create({id: 2, 'first-name': 'Zelda', 'last-name': 'Brown'});
  let authors = this.schema.author.all();

  let result = this.registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, firstName: 'Link', lastName: 'Jackson'},
      {id: 2, firstName: 'Zelda', lastName: 'Brown'}
    ]
  });
});
