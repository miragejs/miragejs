import "../../../lib/container";
import Db from "../../../lib/db";
import Schema from "../../../lib/orm/schema";
import Model from "../../../lib/orm/model";
import Collection from "../../../lib/orm/collection";

describe("Integration | ORM | #find", () => {
  let schema;
  let User = Model.extend();

  beforeEach(() => {
    let db = new Db({
      users: [{ id: 1, name: "Link" }, { id: 2, name: "Zelda" }]
    });

    schema = new Schema(db, {
      user: User
    });
  });

  test("it can find a model by id", () => {
    let zelda = schema.users.find(2);

    expect(zelda instanceof User).toBeTruthy();
    expect(zelda.attrs).toEqual({ id: "2", name: "Zelda" });
  });

  test("it returns null if no model is found for an id", () => {
    let user = schema.users.find(4);

    expect(user).toBeNull();
  });

  test("it can find multiple models by ids", () => {
    let users = schema.users.find([1, 2]);

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models).toHaveLength(2);
    expect(users.models[1].attrs).toEqual({ id: "2", name: "Zelda" });
  });

  test("it errors if incorrect number of models are found for an array of ids", () => {
    expect(function() {
      schema.users.find([1, 6]);
    }).toThrow();
  });
});
