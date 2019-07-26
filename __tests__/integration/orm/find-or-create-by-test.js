import { _ormSchema as Schema, _Db as Db, Model } from "@miragejs/server";
 

describe("Integration | ORM | #findOrCreateBy", function(hooks) {
  hooks.beforeEach(function() {
    let db = new Db({
      users: [
        { id: 1, name: "Link", good: true },
        { id: 2, name: "Zelda", good: true },
        { id: 3, name: "Ganon", good: false }
      ]
    });

    this.User = Model.extend();

    this.schema = new Schema(db, {
      user: this.User
    });
  });

  test("it returns the first model that matches the attrs", assert => {
    let user = this.schema.users.findOrCreateBy({ good: true });

    expect(user instanceof this.User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link", good: true });
  });

  test("it creates a model if no existing model with the attrs is found", assert => {
    expect(this.schema.db.users).toHaveLength(3);

    let newUser = this.schema.users.findOrCreateBy({
      name: "Link",
      good: false
    });

    expect(this.schema.db.users).toHaveLength(4);
    expect(newUser instanceof this.User).toBeTruthy();
    expect(newUser.attrs).toEqual({ id: "4", name: "Link", good: false });
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
