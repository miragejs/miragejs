import { _ormSchema as Schema, _Db as Db, Model } from "@miragejs/server";

let db;

describe("Integration | ORM | destroy", () => {
  beforeEach(() =>  {
    db = new Db({
      users: [
        { id: 1, name: "Link", evil: false },
        { id: 2, name: "Link", location: "Hyrule", evil: false },
        { id: 3, name: "Zelda", location: "Hyrule", evil: false }
      ]
    });

    this.schema = new Schema(db, {
      user: Model
    });
  });

  test("destroying a model removes the associated record from the db", () => {
    expect(db.users).toHaveLength(3);

    let link = this.schema.users.find(1);
    link.destroy();

    expect(db.users.find(1)).toBeNull();
    expect(db.users).toHaveLength(2);
  });

  test("destroying a collection removes the associated records from the db", () => {
    expect(db.users).toHaveLength(3);

    let users = this.schema.users.all();
    users.destroy();

    expect(db.users).toEqual([]);
  });
});
