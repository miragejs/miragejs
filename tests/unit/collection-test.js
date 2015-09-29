import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

module('Unit | Collection');

test('it can be instantiated', function(assert) {
  var collection = new Collection('type');
  assert.ok(collection);
});

test('it cannot be instantiated without a type', function(assert) {
  assert.throws(() => {
    new Collection();
  }, /must pass a type/);
});
