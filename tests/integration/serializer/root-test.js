import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - root:true', {
  beforeEach() {
    const MySerializer = Serializer.extend({
      root: true
    });
    this.serializer = new MySerializer();
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`if root is true, it serializes a model by returning its attrs under a key of the model's type`, function(assert) {
  var user = schemaHelper.getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.deepEqual(result, {
    user: {
      id: 1,
      name: 'Link',
      age: 323
    }
  });
});

test(`if root is true, it serializes a collection of models by returning an array of their attrs under a pluralized key`, function(assert) {
  var collection = schemaHelper.getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, {
    users: [
      {id: 1, name: 'Link', age: 323},
      {id: 2, name: 'Zelda', age: 401}
    ]
  });
});
