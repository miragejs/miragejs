import { _ormSchema as Schema, _Db as Db, Model } from "@miragejs/server";

let schema;
let User = Model.extend();

describe("Integration | ORM | #first", () => {
  beforeEach(() =>  {
    let db = new Db();
    db.createCollection("users");
    db.users.insert([{ id: 1, name: "Link" }, { id: 2, name: "Zelda" }]);
    schema = new Schema(db);

    schema.registerModel("user", User);
  });

  test("it can find the first model", () => {
    let user = schema.users.first();

    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
  });
});
