import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Attrs List', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      wordSmith: Serializer.extend({
        attrs: ['id', 'name']
      })
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    name: 'Link',
    age: 123
  });

  let result = this.registry.serialize(wordSmith);
  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link'
    }
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  let { schema } = this;
  schema.wordSmiths.create({ id: 1, name: 'Link', age: 123 });
  schema.wordSmiths.create({ id: 2, name: 'Zelda', age: 456 });

  let collection = this.schema.wordSmiths.all();
  let result = this.registry.serialize(collection);

  assert.deepEqual(result, {
    wordSmiths: [
      { id: '1', name: 'Link' },
      { id: '2', name: 'Zelda' }
    ]
  });
});
