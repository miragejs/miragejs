import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import Model from "@lib/orm/model";

describe("Integration | ORM | #first", () => {
  let schema;
  let User = Model.extend();

  beforeEach(() => {
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
