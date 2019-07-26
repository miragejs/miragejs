import { _ormSchema as Schema, _Db as Db, Model, Collection } from '@miragejs/server';
import { module, test } from "qunit";

module("Integration | ORM | #all", function() {
  test("it can return all models", assert => {
    let db = new Db({
      users: [{ id: 1, name: "Link" }, { id: 2, name: "Zelda" }]
    });
    let User = Model.extend();
    let schema = new Schema(db, {
      user: User
    });

    let users = schema.users.all();
    expect(users instanceof Collection).toBeTruthy();
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models.length).toEqual(2);
    expect(users.models[1].attrs).toEqual({ id: "2", name: "Zelda" });
  });

  test("it returns an empty array when no models exist", assert => {
    let db = new Db({ users: [] });

    let User = Model.extend();
    let schema = new Schema(db, {
      user: User
    });

    let users = schema.users.all();

    expect(users instanceof Collection).toBeTruthy();
    expect(users.modelName).toEqual("user");
    expect(users.models.length).toEqual(0);
  });
});
