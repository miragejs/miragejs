import {
  Collection,
  _ormSchema as Schema,
  _Db as Db,
  Model
} from "@miragejs/server";

let schema;
let User = Model.extend();

describe("Integration | ORM | #none", function(hooks) {
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

  test("it returns an empty collection", () => {
    let users = schema.users.none();

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models).toHaveLength(0);
  });
});
