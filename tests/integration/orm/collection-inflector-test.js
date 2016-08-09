// jscs:disable disallowVar
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import Inflector from 'ember-inflector';
import {module, test} from 'qunit';

var db, schema, HeadOfState;
module('Integration | ORM | inflector-collectionName integration', {
  beforeEach() {
    Inflector.inflector.irregular('head-of-state', 'heads-of-state');

    HeadOfState = Model.extend();
    db = new Db({});
    schema = new Schema(db);
    schema.registerModel('headOfState', HeadOfState);
  }
});

test(' [regression] collection creation respects irregular plural rules', function(assert) {
  assert.equal(schema.db._collections.length, 1);
  assert.equal(schema.db._collections[0].name, 'headsOfState');
});
