import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - overriding serialize', {
  beforeEach: function() {
    this.registry = new SerializerRegistry(schemaHelper.schema, {
      author: Serializer.extend({
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
  var author = schemaHelper.getModel('author', {
    id: 1,
    title: 'Link',
  });

  var result = this.registry.serialize(author);
  assert.equal(result, 'blah');
});
