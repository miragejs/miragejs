import Schema from 'ember-cli-mirage/orm/schema';
import Model from 'ember-cli-mirage/orm/model';
import Db from 'ember-cli-mirage/db';
import {module, test} from 'qunit';

module('Integration | ORM | #findOrCreateBy', function(hooks) {
  hooks.beforeEach(function() {
    let db = new Db({ users: [
      { id: 1, name: 'Link', good: true },
      { id: 2, name: 'Zelda', good: true },
      { id: 3, name: 'Ganon', good: false }
    ] });

    this.User = Model.extend();

    this.schema = new Schema(db, {
      user: this.User
    });
  });

  test('it returns the first model that matches the attrs', function(assert) {
    let user = this.schema.users.findOrCreateBy({ good: true });

    assert.ok(user instanceof this.User);
    assert.deepEqual(user.attrs, { id: '1', name: 'Link', good: true });
  });

  test('it creates a model if no existing model with the attrs is found', function(assert) {
    assert.equal(this.schema.db.users.length, 3);

    let newUser = this.schema.users.findOrCreateBy({ name: 'Link', good: false });

    assert.equal(this.schema.db.users.length, 4);
    assert.ok(newUser instanceof this.User);
    assert.deepEqual(newUser.attrs, { id: '4', name: 'Link', good: false });
  });

  // test('it returns models that match using a query function', function(assert) {
  //   let users = schema.users.where(function(rec) {
  //     return !rec.good;
  //   });
  //
  //   assert.ok(users instanceof Collection, 'it returns a collection');
  //   assert.equal(users.models.length, 1);
  //   assert.ok(users.models[0] instanceof User);
  //   assert.deepEqual(users.models[0].attrs, { id: '3', name: 'Ganon', good: false });
  // });

  // test('it returns an empty collection if no models match a query', function(assert) {
  //   let users = schema.users.where({ name: 'Link', good: false });
  //
  //   assert.ok(users instanceof Collection, 'it returns a collection');
  //   assert.equal(users.models.length, 0);
  // });
});
