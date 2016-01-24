import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

// Model classes are defined statically, just like in a typical app
var User = Model.extend({
  address: Mirage.hasMany()
});
var Address = Model.extend();

module('Integration | Schema | reinitialize associations', {
  beforeEach: function() {
    this.db = new Db({
      users: [],
      addresses: []
    });

    this.schema = new Schema(this.db, {
      address: Address,
      user: User
    });

    this.schema.user.create({ id: 1, name: 'Link' });
    this.schema.address.create({ id: 1, country: 'Hyrule', userId: 1 });
  }
});

// By running two tests, we force the statically-defined classes to be
// registered twice.
test('safely initializes associations', function(assert) {
  assert.equal(this.schema.user.find(1).address[0].country, 'Hyrule');
});
test('safely initializes associations again', function(assert) {
  assert.equal(this.schema.user.find(1).address[0].country, 'Hyrule');
});
