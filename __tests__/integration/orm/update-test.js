import { Model, _ormSchema as Schema, _Db as Db } from "@miragejs/server";
 

describe("Integration | ORM | update", function(hooks) {
  hooks.beforeEach(function() {
    this.db = new Db({
      users: [
        { id: 1, name: "Link", location: "Hyrule", evil: false },
        { id: 2, name: "Zelda", location: "Hyrule", evil: false }
      ]
    });

    this.schema = new Schema(this.db, {
      user: Model
    });
  });

  test("a collection can update its models with a key and value", assert => {
    let collection = this.schema.users.all();
    collection.update("evil", true);

    expect(this.db.users).toEqual([
      { id: "1", name: "Link", location: "Hyrule", evil: true },
      { id: "2", name: "Zelda", location: "Hyrule", evil: true }
    ]);
    expect(collection.models[0].attrs).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: true
    });
  });

  test("it can update its models with a hash of attrs", assert => {
    let collection = this.schema.users.all();
    collection.update({ location: "The water temple", evil: true });

    expect(this.db.users).toEqual([
      { id: "1", name: "Link", location: "The water temple", evil: true },
      { id: "2", name: "Zelda", location: "The water temple", evil: true }
    ]);
    expect(collection.models[0].attrs).toEqual({
      id: "1",
      name: "Link",
      location: "The water temple",
      evil: true
    });
    expect(collection.models[1].attrs).toEqual({
      id: "2",
      name: "Zelda",
      location: "The water temple",
      evil: true
    });
  });

  test("it can set an attribute and then save the model", assert => {
    let user = this.schema.users.find(1);

    user.name = "Young link";

    expect(user.attrs).toEqual({
      id: "1",
      name: "Young link",
      location: "Hyrule",
      evil: false
    });
    expect(this.db.users.find(1)).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: false
    });

    user.save();

    expect(user.attrs).toEqual({
      id: "1",
      name: "Young link",
      location: "Hyrule",
      evil: false
    });
    expect(this.db.users.find(1)).toEqual({
      id: "1",
      name: "Young link",
      location: "Hyrule",
      evil: false
    });
  });

  test("it can update and immediately persist a single attribute", assert => {
    let link = this.schema.users.find(1);
    link.update("evil", true);

    expect(link.attrs).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: true
    });
    expect(this.db.users.find(1)).toEqual({
      id: "1",
      name: "Link",
      location: "Hyrule",
      evil: true
    });
  });

  test("it can update a hash of attrs immediately", assert => {
    var link = this.schema.users.find(1);
    link.update({ name: "Evil link", evil: true });

    expect(link.attrs).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true
    });
    expect(this.db.users.find(1)).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true
    });
  });

  test("it can update a non-existing attribute", assert => {
    var link = this.schema.users.find(1);
    link.update({
      name: "Evil link",
      evil: true,
      reallyEvil: "absolutely evil"
    });

    expect(link.attrs).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true,
      reallyEvil: "absolutely evil"
    });
    expect(this.db.users.find(1)).toEqual({
      id: "1",
      name: "Evil link",
      location: "Hyrule",
      evil: true,
      reallyEvil: "absolutely evil"
    });
  });

  test("if users sets incorrectly an attribute without using update, it will still work", assert => {
    var link = this.schema.users.find(1);
    link.reallyEvil = "absolutely evil";
    link.update({ reallyEvil: "a little flower", evil: true });
    expect(link.attrs).toEqual({
      id: "1",
      reallyEvil: "a little flower",
      evil: true,
      location: "Hyrule",
      name: "Link"
    });
    expect(this.db.users.find(1)).toEqual({
      id: "1",
      reallyEvil: "a little flower",
      evil: true,
      location: "Hyrule",
      name: "Link"
    });
  });
});
