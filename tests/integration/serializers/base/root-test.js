import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Root', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema, {
      wordSmith: Serializer.extend({
        embed: true,
        root: false
      })
    });
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`if root is false, it serializes a model by returning its attrs`, function(assert) {
  var wordSmith = this.schema.wordSmith.create({
    id: '1',
    name: 'Link',
  });

  var result = this.registry.serialize(wordSmith);
  assert.deepEqual(result, {
    id: '1',
    name: 'Link',
  });
});

test(`if root is false, it serializes a collection of models by returning an array of their attrs`, function(assert) {
  this.schema.wordSmith.create({id: 1, name: 'Link'});
  this.schema.wordSmith.create({id: 2, name: 'Zelda'});
  let wordSmiths = this.schema.wordSmith.all();

  var result = this.registry.serialize(wordSmiths);

  assert.deepEqual(result, [
    {id: '1', name: 'Link'},
    {id: '2', name: 'Zelda'}
  ]);
});

test(`if root is false, it serializes an empty collection by returning an empty array`, function(assert) {
  var emptywordSmithCollection = this.schema.wordSmith.all();
  var result = this.registry.serialize(emptywordSmithCollection);

  assert.deepEqual(result, []);
});
