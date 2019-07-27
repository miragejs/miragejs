import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import Model from "@lib/orm/model";
import Collection from "@lib/orm/collection";

describe("Integration | ORM | #none", () => {
  let schema;
  let User = Model.extend();

  beforeEach(() => {
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
