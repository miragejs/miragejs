import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Overriding Serialize', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      wordSmith: Serializer.extend({
        serialize(response, request) {
          return 'blah';
        }
      })
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can use a completely custom serialize function`, function(assert) {
  let wordSmith = this.schema.wordSmith.create({
    id: 1,
    title: 'Link',
  });

  let result = this.registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: 'blah'
  });
});
