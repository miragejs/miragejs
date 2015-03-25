import Schema from 'ember-cli-mirage/orm/schema';
import {module, test} from 'qunit';

module('mirage:schema');

test('it can be instantiated', function(assert) {
  var dbMock = {};
  var schema = new Schema(dbMock);
  assert.ok(schema);
});

test('it cannot be instantiated without a db', function(assert) {
  assert.throws(function() {
    var schema = new Schema();
  }, /requires a db/);
});
