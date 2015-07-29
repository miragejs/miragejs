import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - attrs list', {
  beforeEach: function() {
    const MySerializer = Serializer.extend({
      attrs: ['id', 'name']
    });
    this.serializer = new MySerializer();
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`it returns only the whitelisted attrs when serializing a model`, function(assert) {
  var user = schemaHelper.getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.deepEqual(result, {
    id: 1,
    name: 'Link'
  });
});

test(`it returns only the whitelisted attrs when serializing a collection`, function(assert) {
  var collection = schemaHelper.getUserCollection([
    {id: 1, name: 'Link', age: 323},
    {id: 2, name: 'Zelda', age: 401}
  ]);

  var result = this.serializer.serialize(collection);
  assert.deepEqual(result, [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ]);
});
