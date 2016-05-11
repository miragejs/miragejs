import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

import _uniq from 'lodash/array/uniq';

module('Integration | Serializers | Base | Basic', {
  beforeEach() {
    this.schema = schemaHelper.setup();
    this.registry = new SerializerRegistry(this.schema);
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test('it returns objects unaffected', function(assert) {
  let result = this.registry.serialize({ oh: 'hai' });

  assert.deepEqual(result, { oh: 'hai' });
});

test('it returns arrays unaffected', function(assert) {
  let data = [{ id: '1', name: 'Link' }, { id: '2', name: 'Zelda' }];
  let result = this.registry.serialize(data);

  assert.deepEqual(result, data);
});

test('it returns empty arrays unaffected', function(assert) {
  let result = this.registry.serialize([]);

  assert.deepEqual(result, []);
});

test(`it serializes a model by returning its attrs under a root`, function(assert) {
  let wordSmith = this.schema.wordSmiths.create({
    id: 1,
    name: 'Link'
  });
  let result = this.registry.serialize(wordSmith);

  assert.deepEqual(result, {
    wordSmith: {
      id: '1',
      name: 'Link'
    }
  });
});

test(`it serializes a collection of models by returning an array of their attrs under a pluralized root`, function(assert) {
  this.schema.wordSmiths.create({ id: 1, name: 'Link' });
  this.schema.wordSmiths.create({ id: 2, name: 'Zelda' });

  let wordSmiths = this.schema.wordSmiths.all();

  let result = this.registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      { id: '1', name: 'Link' },
      { id: '2', name: 'Zelda' }
    ]
  });
});

test(`it can serialize an empty collection`, function(assert) {
  let wordSmiths = this.schema.wordSmiths.all();
  let result = this.registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: []
  });
});

test('it returns POJAs of models unaffected', function(assert) {
  this.schema.wordSmiths.create({ name: 'Sam' });
  this.schema.wordSmiths.create({ name: 'Sam' });
  this.schema.wordSmiths.create({ name: 'Ganondorf' });

  let wordSmiths = this.schema.wordSmiths.all().models;
  let uniqueNames = _uniq(wordSmiths, u => u.name);
  let result = this.registry.serialize(uniqueNames);

  assert.deepEqual(result, uniqueNames);
});
