import "../../../lib/container";
import Db from "../../../lib/db";
import Schema from "../../../lib/orm/schema";
import Model from "../../../lib/orm/model";

describe("Integration | ORM | create", () => {
  let db, schema, User;

  beforeEach(() => {
    User = Model.extend();
    db = new Db();
    schema = new Schema(db, {
      user: User
    });
  });

  test("it cannot make new models that havent been registered", () => {
    expect(function() {
      schema.authors.new({ name: "Link" });
    }).toThrow();
  });

  test("it cannot create models that havent been registered", () => {
    expect(function() {
      schema.authors.create({ name: "Link" });
    }).toThrow();
  });

  test("it can make new models and then save them", () => {
    let user = schema.users.new({ name: "Link" });

    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ name: "Link" });
    expect(db.users).toBeEmpty();

    user.save();

    expect(user.id).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
    expect(db.users).toIncludeSameMembers([{ id: "1", name: "Link" }]);
  });

  test("it can create new models, saved directly to the db", () => {
    let user = schema.users.create({ name: "Link" });

    expect(user instanceof Model).toBeTruthy();
    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link" });
    expect(db.users).toIncludeSameMembers([{ id: "1", name: "Link" }]);
  });
});
