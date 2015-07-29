import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - overriding serialize', {
  beforeEach: function() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      post: Serializer.extend({
        serialize(response, request) {
          return 'blah';
        }
      })
    });
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`it can use a completely custom serialize function`, function(assert) {
  var post = schemaHelper.getModel('post', {
    id: 1,
    title: 'Lorem',
  });

  var result = this.registry.serialize(post);
  assert.equal(result, 'blah');
});
