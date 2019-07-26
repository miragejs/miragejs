import { _Db as Db, _ormSchema as Schema, Model } from '@miragejs/server';
import { module, test } from "qunit";

var db, schema, User;

module("Integration | ORM | attrs", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db(
      { users: [{ id: 1, name: "Link", evil: false }] }
    );

    User = Model.extend();
    schema = new Schema(db, {
      user: User
    });
  });

  test("attrs returns the models attributes", assert => {
    let user = schema.users.find(1);

    expect(user.attrs).toEqual({ id: "1", name: "Link", evil: false });
  });

  test("attributes can be read via plain property access", assert => {
    let user = schema.users.find(1);

    expect(user.name).toEqual("Link");
  });
});
