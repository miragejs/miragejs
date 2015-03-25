import Collection from 'ember-cli-mirage/orm/collection';
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/orm/db';
import {module, test} from 'qunit';

module('mirage:collection');

test('it can be instantiated', function(assert) {
  var collection = new Collection();
  assert.ok(collection);
});
