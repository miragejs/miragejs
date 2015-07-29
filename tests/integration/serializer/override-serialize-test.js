import Serializer from 'ember-cli-mirage/serializer';
import schemaHelper from './schema-helper';
import { module, test } from 'qunit';

schemaHelper.setup();

module('mirage:serializer - overriding serialize', {
  beforeEach: function() {
    const MySerializer = Serializer.extend({
      serialize(response, request) {
        return 'blah';
      }
    });
    this.serializer = new MySerializer();
  },
  afterEach() {
    schemaHelper.emptyData();
  }
});

test(`it can use a completely custom serialize function`, function(assert) {
  var user = schemaHelper.getUserModel({
    id: 1,
    name: 'Link',
    age: 323,
  });

  var result = this.serializer.serialize(user);
  assert.equal(result, 'blah');
});
