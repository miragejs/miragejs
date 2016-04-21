import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from '../schema-helper';
import { camelize } from 'ember-cli-mirage/utils/inflector';
import {module, test} from 'qunit';

module('Integration | Serializers | Base | Attribute Key Formatting', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      wordSmith: Serializer.extend({
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
  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    'first-name': 'Link',
    'last-name': 'Jackson',
    age: 323
  });

  let result = this.registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      firstName: 'Link',
      lastName: 'Jackson',
      age: 323
    }
  });
});

test(`keyForAttribute also formats the models in a collections`, function(assert) {
  this.schema.wordSmiths.create({ id: 1, 'first-name': 'Link', 'last-name': 'Jackson' });
  this.schema.wordSmiths.create({ id: 2, 'first-name': 'Zelda', 'last-name': 'Brown' });
  let wordSmiths = this.schema.wordSmiths.all();

  let result = this.registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      { id: '1', firstName: 'Link', lastName: 'Jackson' },
      { id: '2', firstName: 'Zelda', lastName: 'Brown' }
    ]
  });
});
