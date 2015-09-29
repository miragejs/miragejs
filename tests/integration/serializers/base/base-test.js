import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../schema-helper';
import { module, test } from 'qunit';

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
  var result = this.registry.serialize({oh: 'hai'});

  assert.deepEqual(result, {oh: 'hai'});
});

test('it returns arrays unaffected', function(assert) {
  var data = [{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}];
  var result = this.registry.serialize(data);

  assert.deepEqual(result, data);
});

test(`it serializes a model by returning its attrs under a root`, function(assert) {
  var author = this.schema.author.create({
    id: 1,
    name: 'Link',
  });

  var result = this.registry.serialize(author);
  assert.deepEqual(result, {
    author: {
      id: 1,
      name: 'Link',
    }
  });
});

test(`it serializes a collection of models by returning an array of their attrs under a puralized root`, function(assert) {
  this.schema.author.create({id: 1, name: 'Link'});
  this.schema.author.create({id: 2, name: 'Zelda'});

  let authors = this.schema.author.all();

  let result = this.registry.serialize(authors);

  assert.deepEqual(result, {
    authors: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });
});

test(`it can serialize an empty collection`, function(assert) {
  var authors = this.schema.author.all();
  var result = this.registry.serialize(authors);

  assert.deepEqual(result, {
    authors: []
  });
});
