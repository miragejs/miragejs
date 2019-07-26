import "../../../lib/container";
import Db from "../../../lib/db";
import Schema from "../../../lib/orm/schema";
import Model from "../../../lib/orm/model";

describe("Integration | ORM | destroy", () => {
  let db, schema;

  beforeEach(() => {
    db = new Db({
      users: [
        { id: 1, name: "Link", evil: false },
        { id: 2, name: "Link", location: "Hyrule", evil: false },
        { id: 3, name: "Zelda", location: "Hyrule", evil: false }
      ]
    });

    schema = new Schema(db, {
      user: Model
    });
  });

  test("destroying a model removes the associated record from the db", () => {
    expect(db.users).toHaveLength(3);

    let link = schema.users.find(1);
    link.destroy();

    expect(db.users.find(1)).toBeNull();
    expect(db.users).toHaveLength(2);
  });

  test("destroying a collection removes the associated records from the db", () => {
    expect(db.users).toHaveLength(3);

    let users = schema.users.all();
    users.destroy();

    expect(db.users).toBeEmpty();
  });
});
