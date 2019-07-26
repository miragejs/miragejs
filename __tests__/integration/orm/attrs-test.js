import "../../../lib/container";
import Db from "../../../lib/db";
import Schema from "../../../lib/orm/schema";
import Model from "../../../lib/orm/model";

describe("Integration | ORM | attrs", () => {
  let db, schema, User;

  beforeEach(() => {
    db = new Db({ users: [{ id: 1, name: "Link", evil: false }] });

    User = Model.extend();
    schema = new Schema(db, {
      user: User
    });
  });

  test("attrs returns the models attributes", () => {
    let user = schema.users.find(1);

    expect(user.attrs).toEqual({ id: "1", name: "Link", evil: false });
  });

  test("attributes can be read via plain property access", () => {
    let user = schema.users.find(1);

    expect(user.name).toEqual("Link");
  });
});
