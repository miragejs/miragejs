import { _ormSchema as Schema, _Db as Db, Model } from "@miragejs/server";
 

var db, schema, User;

describe("Integration | ORM | create", function(hooks) {
  hooks.beforeEach(function() {
    User = Model.extend();
    db = new Db();
    schema = new Schema(db, {
      user: User
    });
  });

  test("it cannot make new models that havent been registered", assert => {
    expect(function() {
      schema.authors.new({ name: "Link" });
    }).toThrow();
  });

  test("it cannot create models that havent been registered", assert => {
    expect(function() {
      schema.authors.create({ name: "Link" });
    }).toThrow();
  });

  test("it can make new models and then save them", assert => {
    let user = schema.users.new({ name: "Link" });

    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ name: "Link" });
    expect(db.users).toEqual([]);

    user.save();

    expect(user.id).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
    expect(db.users).toEqual([{ id: "1", name: "Link" }]);
  });

  test("it can create new models, saved directly to the db", assert => {
    let user = schema.users.create({ name: "Link" });

    expect(user instanceof Model).toBeTruthy();
    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
    expect(db.users).toEqual([{ id: "1", name: "Link" }]);
  });
});
