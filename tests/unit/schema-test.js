import Schema from 'ember-cli-mirage/orm/schema';
import {module, test} from 'qunit';

module('Unit | Schema');

test('it can be instantiated', function(assert) {
  let dbMock = {};
  let schema = new Schema(dbMock);
  assert.ok(schema);
});

test('it cannot be instantiated without a db', function(assert) {
  assert.throws(function() {
    new Schema();
  }, /requires a db/);
});
