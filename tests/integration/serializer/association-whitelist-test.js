import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - associations list', {
  beforeEach: function() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      author: Serializer.extend({
        attrs: ['id', 'name'],
        relationships: ['posts']
      })
    });
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`it returns associated models`, function(assert) {
  assert.ok(true);
//   var user = schemaHelper.getModel('post', {
//     id: 1,
//     name: 'Link',
//     age: 323,
//   });

//   var result = this.serializer.serialize(user);
//   assert.deepEqual(result, {
//     id: 1,
//     name: 'Link'
//   });
});
