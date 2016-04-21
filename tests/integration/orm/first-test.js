// jscs:disable disallowVar
import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

let schema;
let User = Model.extend();
module('Integration | ORM | #first', {
  beforeEach() {
    let db = new Db();
    db.createCollection('users');
    db.users.insert([{ id: 1, name: 'Link' }, { id: 2, name: 'Zelda' }]);
    schema = new Schema(db);

    schema.registerModel('user', User);
  }
});

test('it can find the first model', function(assert) {
  let user = schema.users.first();

  assert.ok(user instanceof User);
  assert.deepEqual(user.attrs, { id: '1', name: 'Link' });
});
