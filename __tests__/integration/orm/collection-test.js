import "@lib/container";
import Db from "@lib/db";
import Schema from "@lib/orm/schema";
import Model from "@lib/orm/model";
import Collection from "@lib/orm/collection";

describe("Integration | ORM | collection", () => {
  let User, db, schema;

  beforeEach(() => {
    User = Model.extend();
    db = new Db({
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

  test("a collection can save its models", () => {
    let collection = schema.users.all();
    collection.models[0].name = "Sam";
    collection.save();

    expect(db.users[0]).toEqual({ id: "1", name: "Sam", good: true });
  });

  test("a collection can reload its models", () => {
    let collection = schema.users.all();
    expect(collection.models[0].name).toEqual("Link");

    collection.models[0].name = "Sam";
    expect(collection.models[0].name).toEqual("Sam");

    collection.reload();
    expect(collection.models[0].name).toEqual("Link");
  });

  test("a collection can filter its models", () => {
    let collection = schema.users.all();
    expect(collection.models).toHaveLength(3);

    let newCollection = collection.filter(author => author.good);

    expect(newCollection instanceof Collection).toBeTruthy();
    expect(newCollection.modelName).toEqual("user");
    expect(newCollection.models).toHaveLength(2);
  });

  test("a collection can sort its models", () => {
    let collection = schema.users.all();
    expect(collection.models.map(m => m.name)).toEqual([
      "Link",
      "Zelda",
      "Ganon"
    ]);

    let newCollection = collection.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    expect(newCollection instanceof Collection).toBeTruthy();
    expect(newCollection.modelName).toEqual("user");
    expect(newCollection.models.map(m => m.name)).toEqual([
      "Ganon",
      "Link",
      "Zelda"
    ]);
  });

  test("a collection can slice its models", () => {
    let collection = schema.users.all();
    expect(collection.models.map(m => m.name)).toEqual([
      "Link",
      "Zelda",
      "Ganon"
    ]);

    let newCollection = collection.slice(-2);

    expect(newCollection instanceof Collection).toBeTruthy();
    expect(newCollection.modelName).toEqual("user");
    expect(newCollection.models.map(m => m.name)).toEqual(["Zelda", "Ganon"]);
  });

  test("a collection can merge with another collection", () => {
    let goodGuys = schema.users.where(user => user.good);
    let badGuys = schema.users.where(user => !user.good);

    expect(goodGuys.models).toHaveLength(2);
    expect(badGuys.models).toHaveLength(1);

    goodGuys.mergeCollection(badGuys);

    expect(goodGuys.models).toHaveLength(3);
  });
});
