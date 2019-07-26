import {
  Model,
  Collection,
  _ormSchema as Schema,
  _Db as Db
} from "@miragejs/server";
import { module, test } from "qunit";

let schema;
let User = Model.extend();

module("Integration | ORM | #where", function(hooks) {
  hooks.beforeEach(function() {
    let db = new Db({
      users: [
        { id: 1, name: "Link", good: true },
        { id: 2, name: "Zelda", good: true },
        { id: 3, name: "Ganon", good: false }
      ]
    });

    schema = new Schema(db, {
      user: User
    });
  });

  test("it returns models that match a query with where", assert => {
    let users = schema.users.where({ good: false });

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(1);
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models[0].attrs).toEqual({
      id: "3",
      name: "Ganon",
      good: false
    });
  });

  test("it returns models that match using a query function", assert => {
    let users = schema.users.where(function(rec) {
      return !rec.good;
    });

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(1);
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models[0].attrs).toEqual({
      id: "3",
      name: "Ganon",
      good: false
    });
  });

  test("it returns an empty collection if no models match a query", assert => {
    let users = schema.users.where({ name: "Link", good: false });

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(0);
  });
});
