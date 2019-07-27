import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import Model from "@lib/orm/model";

describe("Integration | ORM | #findOrCreateBy", () => {
  let User, schema;

  beforeEach(() => {
    let db = new Db({
      users: [
        { id: 1, name: "Link", good: true },
        { id: 2, name: "Zelda", good: true },
        { id: 3, name: "Ganon", good: false }
      ]
    });

    User = Model.extend();

    schema = new Schema(db, {
      user: User
    });
  });

  test("it returns the first model that matches the attrs", () => {
    let user = schema.users.findOrCreateBy({ good: true });

    expect(user instanceof User).toBeTruthy();
    expect(user.attrs).toEqual({ id: "1", name: "Link", good: true });
  });

  test("it creates a model if no existing model with the attrs is found", () => {
    expect(schema.db.users).toHaveLength(3);

    let newUser = schema.users.findOrCreateBy({
      name: "Link",
      good: false
    });

    expect(schema.db.users).toHaveLength(4);
    expect(newUser instanceof User).toBeTruthy();
    expect(newUser.attrs).toEqual({ id: "4", name: "Link", good: false });
  });
});
