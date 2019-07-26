import {
  _ormSchema as Schema,
  _Db as Db,
  Collection,
  Model
} from "@miragejs/server";
 

describe("Integration | ORM | collection", function(hooks) {
  hooks.beforeEach(function() {
    this.User = Model.extend();
    this.db = new Db({
      users: [
        { id: 1, name: "Link", good: true },
        { id: 2, name: "Zelda", good: true },
        { id: 3, name: "Ganon", good: false }
      ]
    });

    this.schema = new Schema(this.db, {
      user: this.User
    });
  });

  test("a collection can save its models", assert => {
    let collection = this.schema.users.all();
    collection.models[0].name = "Sam";
    collection.save();

    expect(this.db.users[0]).toEqual({ id: "1", name: "Sam", good: true });
  });

  test("a collection can reload its models", assert => {
    let collection = this.schema.users.all();
    expect(collection.models[0].name).toEqual("Link");

    collection.models[0].name = "Sam";
    expect(collection.models[0].name).toEqual("Sam");

    collection.reload();
    expect(collection.models[0].name).toEqual("Link");
  });

  test("a collection can filter its models", assert => {
    let collection = this.schema.users.all();
    expect(collection.models).toHaveLength(3);

    let newCollection = collection.filter(author => author.good);

    expect(newCollection instanceof Collection).toBeTruthy();
    expect(newCollection.modelName).toEqual("user");
    expect(newCollection.models).toHaveLength(2);
  });

  test("a collection can sort its models", assert => {
    let collection = this.schema.users.all();
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

  test("a collection can slice its models", assert => {
    let collection = this.schema.users.all();
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

  test("a collection can merge with another collection", assert => {
    let goodGuys = this.schema.users.where(user => user.good);
    let badGuys = this.schema.users.where(user => !user.good);

    expect(goodGuys.models).toHaveLength(2);
    expect(badGuys.models).toHaveLength(1);

    goodGuys.mergeCollection(badGuys);

    expect(goodGuys.models).toHaveLength(3);
  });
});
