// jscs:disable disallowVar
import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

// Model classes are defined statically, just like in a typical app
var User = Model.extend({
  addresses: Mirage.hasMany()
});
var Address = Model.extend();

module('Integration | ORM | reinitialize associations', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      address: Address,
      user: User
    });

    this.schema.users.create({ id: 1, name: 'Link' });
    this.schema.addresses.create({ id: 1, country: 'Hyrule', userId: 1 });
  }
});

// By running two tests, we force the statically-defined classes to be
// registered twice.
test('safely initializes associations', function(assert) {
  assert.equal(this.schema.users.find(1).addresses.models[0].country, 'Hyrule');
});
test('safely initializes associations again', function(assert) {
  assert.equal(this.schema.users.find(1).addresses.models[0].country, 'Hyrule');
});
