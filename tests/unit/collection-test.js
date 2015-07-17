import Collection from 'ember-cli-mirage/orm/collection';
import {module, test} from 'qunit';

module('mirage:collection');

test('it can be instantiated', function(assert) {
  var collection = new Collection();
  assert.ok(collection);
});
