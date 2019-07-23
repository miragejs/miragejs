import {
  _Db as Db,
  IdentityManager as DefaultIdentityManager
} from "@miragejs/server";
import { module, test } from "qunit";

let db;

module("Unit | Db", function() {
  test("it can be instantiated", assert => {
    db = new Db();
    expect(db).toBeTruthy();
  });

  test("it can load data on instantiation", assert => {
    db = new Db({
      users: [{ id: 1, name: "Link" }],
      addresses: [
        { id: 1, name: "123 Hyrule Way" },
        { id: 2, name: "Lorem ipsum" }
      ]
    });

    expect(db.users.length).toEqual(1);
    expect(db.addresses.length).toEqual(2);
  });

  test("it can empty its data", assert => {
    db = new Db({
      users: [{ id: 1, name: "Link" }],
      addresses: [
        { id: 1, name: "123 Hyrule Way" },
        { id: 2, name: "Lorem ipsum" }
      ]
    });

    db.emptyData();

    expect(db.users.length).toEqual(0);
    expect(db.addresses.length).toEqual(0);
  });
});

module("Unit | Db #createCollection", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("it can create an empty collection", assert => {
    db.createCollection("contacts");

    expect(db.contacts).toBeTruthy();
  });

  test("it can create many collections", assert => {
    db.createCollections("contacts", "addresses");

    expect(db.contacts).toBeTruthy();
    expect(db.addresses).toBeTruthy();
  });
});

module("Unit | Db #loadData", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("it can load an object of data", assert => {
    let data = {
      contacts: [{ id: "1", name: "Link" }],
      addresses: [{ id: "1", name: "123 Hyrule Way" }]
    };
    db.loadData(data);

    expect(db.contacts).toEqual(data.contacts);
    expect(db.addresses).toEqual(data.addresses);
  });

  test("it clones all data so nothing is passed by reference", assert => {
    let data = {
      contacts: [{ id: "1", someArray: ["foo", "bar"] }]
    };
    db.loadData(data);

    let contactRecord = db.contacts.find(1);
    contactRecord.someArray.push("baz");

    expect(contactRecord.someArray.length).toEqual(3);
    expect(data.contacts[0].someArray.length).toEqual(2);
  });
});

module("Unit | Db #all", function(hooks) {
  hooks.beforeEach(function() {
    this.data = {
      contacts: [{ id: "1", name: "Link" }],
      addresses: [{ id: "1", name: "123 Hyrule Way" }]
    };

    db = new Db(this.data);
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("it can return a collection", assert => {
    expect(db.contacts).toEqual(this.data.contacts);
    expect(db.addresses).toEqual(this.data.addresses);
  });

  test("the collection is a copy", assert => {
    let { contacts } = db;

    expect(contacts).toEqual(this.data.contacts);
    contacts[0].name = "Zelda";

    expect(db.contacts).toEqual(this.data.contacts);
  });
});

module("Unit | Db #insert", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
    db.createCollection("contacts");
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("it inserts an object and returns it", assert => {
    let link = db.contacts.insert({ name: "Link" });
    let expectedRecord = {
      id: "1",
      name: "Link"
    };

    expect(db.contacts).toEqual([expectedRecord]);
    expect(link).toEqual(expectedRecord);
  });

  test("it returns a copy", assert => {
    let link = db.contacts.insert({ name: "Link" });
    let expectedRecord = {
      id: "1",
      name: "Link"
    };

    expect(link).toEqual(expectedRecord);

    link.name = "Young link";

    expect(db.contacts.find(1)).toEqual(expectedRecord);
  });

  test("it can insert objects sequentially", assert => {
    db.contacts.insert({ name: "Link" });
    db.contacts.insert({ name: "Ganon" });

    let records = [{ id: "1", name: "Link" }, { id: "2", name: "Ganon" }];

    expect(db.contacts).toEqual(records);
  });

  test("it does not add an id if present", assert => {
    let attrs = { id: "5", name: "Link" };

    db.contacts.insert(attrs);

    expect(db.contacts).toEqual([attrs]);
  });

  test("it can insert an array and return it", assert => {
    db.contacts.insert({ name: "Link" });

    let contacts = db.contacts.insert([{ name: "Zelda" }, { name: "Ganon" }]);

    expect(db.contacts).toEqual([
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
      { id: "3", name: "Ganon" }
    ]);
    expect(contacts).toEqual([
      { id: "2", name: "Zelda" },
      { id: "3", name: "Ganon" }
    ]);
  });

  test("it does not add ids to array data if present", assert => {
    db.contacts.insert([{ id: 2, name: "Link" }, { id: 1, name: "Ganon" }]);

    expect(db.contacts).toEqual([
      { id: "2", name: "Link" },
      { id: "1", name: "Ganon" }
    ]);
  });

  test("it can insert a record with an id of 0", assert => {
    db.contacts.insert({ id: 0, name: "Link" });

    expect(db.contacts).toEqual([{ id: "0", name: "Link" }]);
  });

  test("IDs increment correctly, even after a record is removed", assert => {
    let records = db.contacts.insert([{ name: "Link" }, { name: "Ganon" }]);

    db.contacts.remove(records[0]);

    let record = db.contacts.insert({ name: "Zelda" });

    expect(record.id).toEqual(3);
  });

  test("inserting a record with an already used ID throws an error", assert => {
    assert.expect(2);

    db.contacts.insert({ id: 1, name: "Duncan McCleod" });

    expect(function() {
      db.contacts.insert({ id: 1, name: "Duncan McCleod" });
    }).toThrow();

    db.contacts.insert({ id: "atp", name: "Adenosine Triphosphate" });

    expect(function() {
      db.contacts.insert({ id: "atp", name: "Adenosine Triphosphate" });
    }).toThrow();
  });

  test("tracks the correct IDs being used", assert => {
    db.contacts.insert({ name: "Vegeta" });
    db.contacts.insert({ id: 2, name: "Krilli" });

    expect(db.contacts.length).toEqual(2);
  });
});

module("Unit | Db #findBy", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Zelda" },
      { name: "Link" },
      { name: "Epona", race: "Horse" },
      { name: "Epona", race: "Centaur" },
      { id: "abc", name: "Ganon" }
    ]);
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("returns a record that matches the given name", assert => {
    let contact = db.contacts.findBy({ name: "Link" });

    expect(contact).toEqual({ id: "2", name: "Link" });
  });

  test("returns a copy not a reference", assert => {
    let contact = db.contacts.findBy({ name: "Link" });

    contact.name = "blah";

    expect(db.contacts.find(2)).toEqual({ id: "2", name: "Link" });
  });

  test("returns the first record matching the criteria", assert => {
    let contact = db.contacts.findBy({ name: "Epona" });

    expect(contact).toEqual({ id: "3", name: "Epona", race: "Horse" });
  });

  test("returns a record only matching multiple criteria", assert => {
    let contact = db.contacts.findBy({ name: "Epona", race: "Centaur" });

    expect(contact).toEqual({ id: "4", name: "Epona", race: "Centaur" });
  });

  test("returns null when no record is found", assert => {
    let contact = db.contacts.findBy({ name: "Fi" });

    expect(contact).toEqual(null);
  });
});

module("Unit | Db #find", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Zelda" },
      { name: "Link" },
      { id: "abc", name: "Ganon" }
    ]);
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("returns a record that matches a numerical id", assert => {
    let contact = db.contacts.find(2);

    expect(contact).toEqual({ id: "2", name: "Link" });
  });

  test("returns a copy not a reference", assert => {
    let contact = db.contacts.find(2);

    expect(contact).toEqual({ id: "2", name: "Link" });

    contact.name = "blah";

    expect(db.contacts.find(2)).toEqual({ id: "2", name: "Link" });
  });

  test("returns a record that matches a string id", assert => {
    let contact = db.contacts.find("abc");

    expect(contact).toEqual({ id: "abc", name: "Ganon" });
  });

  test("returns multiple record that matches an array of ids", assert => {
    let contacts = db.contacts.find([1, 2]);

    expect(contacts).toEqual([
      { id: "1", name: "Zelda" },
      { id: "2", name: "Link" }
    ]);
  });

  test("returns a record whose id is a string that start with numbers", assert => {
    db.contacts.insert({
      id: "123-456",
      name: "Epona"
    });

    let contact = db.contacts.find("123-456");
    expect(contact).toEqual({ id: "123-456", name: "Epona" });
  });

  test("returns multiple record that match an array of ids", assert => {
    let contacts = db.contacts.find([1, 2]);

    expect(contacts).toEqual([
      { id: "1", name: "Zelda" },
      { id: "2", name: "Link" }
    ]);
  });

  test("returns an empty array when it doesnt find multiple ids", assert => {
    let contacts = db.contacts.find([99, 100]);

    expect(contacts).toEqual([]);
  });
});

module("Unit | Db #where", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Link", evil: false, age: 17 },
      { name: "Zelda", evil: false, age: 17 },
      { name: "Ganon", evil: true, age: 45 }
    ]);
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("returns an array of records that match the query", assert => {
    let result = db.contacts.where({ evil: true });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);
  });

  test("it coerces query params to strings", assert => {
    let result = db.contacts.where({ age: "45" });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);
  });

  test("returns a copy, not a referecne", assert => {
    let result = db.contacts.where({ evil: true });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);

    result[0].evil = false;

    expect(db.contacts.where({ evil: true })).toEqual([
      { id: "3", name: "Ganon", evil: true, age: 45 }
    ]);
  });

  test("returns an empty array if no records match the query", assert => {
    let result = db.contacts.where({ name: "Link", evil: true });

    expect(result).toEqual([]);
  });

  test("accepts a filter function", assert => {
    let result = db.contacts.where(function(record) {
      return record.age === 45;
    });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);
  });
});

module("Unit | Db #update", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Link", evil: false },
      { name: "Zelda", evil: false },
      { name: "Ganon", evil: true },
      { id: "123-abc", name: "Epona", evil: false }
    ]);
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("it can update the whole collection", assert => {
    db.contacts.update({ name: "Sam", evil: false });

    let actualContacts = db.contacts;

    let expectedContacts = [
      { id: "1", name: "Sam", evil: false },
      { id: "2", name: "Sam", evil: false },
      { id: "3", name: "Sam", evil: false },
      { id: "123-abc", name: "Sam", evil: false }
    ];

    expect(actualContacts).toEqual(expectedContacts);
  });

  test("it can update a record by id", assert => {
    db.contacts.update(3, { name: "Ganondorf", evil: false });
    let ganon = db.contacts.find(3);

    expect(ganon).toEqual({ id: "3", name: "Ganondorf", evil: false });
  });

  test("it can update a record by id when the id is a string", assert => {
    db.contacts.update("123-abc", { evil: true });
    let epona = db.contacts.find("123-abc");

    expect(epona).toEqual({ id: "123-abc", name: "Epona", evil: true });
  });

  test("it can update multiple records by ids", assert => {
    db.contacts.update([1, 2], { evil: true });
    let link = db.contacts.find(1);
    let zelda = db.contacts.find(2);

    expect(link.evil).toEqual(true);
    expect(zelda.evil).toEqual(true);
  });

  test("it can update records by query", assert => {
    db.contacts.update({ evil: false }, { name: "Sam" });

    expect(db.contacts).toEqual([
      { id: "1", name: "Sam", evil: false },
      { id: "2", name: "Sam", evil: false },
      { id: "3", name: "Ganon", evil: true },
      { id: "123-abc", name: "Sam", evil: false }
    ]);
  });

  test("updating a single record returns that record", assert => {
    let ganon = db.contacts.update(3, { name: "Ganondorf" });
    expect(ganon).toEqual({ id: "3", name: "Ganondorf", evil: true });
  });

  test("updating a collection returns the updated records", assert => {
    let characters = db.contacts.update({ evil: true });
    expect(characters).toEqual([
      { id: "1", name: "Link", evil: true },
      { id: "2", name: "Zelda", evil: true },
      { id: "123-abc", name: "Epona", evil: true }
    ]);
  });

  test("updating multiple records returns the updated records", assert => {
    let characters = db.contacts.update({ evil: false }, { evil: true });
    expect(characters).toEqual([
      { id: "1", name: "Link", evil: true },
      { id: "2", name: "Zelda", evil: true },
      { id: "123-abc", name: "Epona", evil: true }
    ]);
  });

  test("throws when updating an ID is attempted", assert => {
    assert.expect(1);

    expect(function() {
      db.contacts.update(1, { id: 3 });
    }).toThrow();
  });
});

module("Unit | Db #remove", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Link", evil: false },
      { name: "Zelda", evil: false },
      { name: "Ganon", evil: true },
      { id: "123-abc", name: "Epona", evil: false }
    ]);
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("it can remove an entire collection", assert => {
    db.contacts.remove();

    expect(db.contacts).toEqual([]);
  });

  test("it can remove a single record by id", assert => {
    db.contacts.remove(1);

    expect(db.contacts).toEqual([
      { id: "2", name: "Zelda", evil: false },
      { id: "3", name: "Ganon", evil: true },
      { id: "123-abc", name: "Epona", evil: false }
    ]);
  });

  test("it can remove a single record when the id is a string", assert => {
    db.contacts.remove("123-abc");

    expect(db.contacts).toEqual([
      { id: "1", name: "Link", evil: false },
      { id: "2", name: "Zelda", evil: false },
      { id: "3", name: "Ganon", evil: true }
    ]);
  });

  test("it can remove multiple records by ids", assert => {
    db.contacts.remove([1, 2]);

    expect(db.contacts).toEqual([
      { id: "3", name: "Ganon", evil: true },
      { id: "123-abc", name: "Epona", evil: false }
    ]);
  });

  test("it can remove multiple records by query", assert => {
    db.contacts.remove({ evil: false });

    expect(db.contacts).toEqual([{ id: "3", name: "Ganon", evil: true }]);
  });

  test("it can add a record after removing all records", assert => {
    db.contacts.remove();
    db.contacts.insert({ name: "Foo" });

    expect(db.contacts.length).toEqual(1);
    expect(db.contacts).toEqual([{ id: "1", name: "Foo" }]);
  });
});

module("Unit | Db #firstOrCreate", function(hooks) {
  hooks.beforeEach(function() {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { id: 1, name: "Link", evil: false },
      { id: 2, name: "Zelda", evil: false },
      { id: 3, name: "Ganon", evil: true }
    ]);
  });

  hooks.afterEach(function() {
    db.emptyData();
  });

  test("it can find the first record available from the query", assert => {
    let record = db.contacts.firstOrCreate({ name: "Link" });

    expect(record).toEqual({ id: "1", name: "Link", evil: false });
  });

  test("it creates a new record from query + attrs if none found", assert => {
    let record = db.contacts.firstOrCreate({ name: "Mario" }, { evil: false });

    expect(record.name).toEqual("Mario");
    expect(record.evil).toEqual(false);
    expect(record.id).toBeTruthy();
  });

  test("does not require attrs", assert => {
    let record = db.contacts.firstOrCreate({ name: "Luigi" });

    expect(record.name).toEqual("Luigi");
    expect(record.id).toBeTruthy();
  });
});

module(
  "Unit | Db #registerIdentityManagers and #identityManagerFor",
  function() {
    test("identityManagerFor returns ember-cli-mirage default IdentityManager if there aren't any custom ones", assert => {
      let db = new Db();
      expect(db.identityManagerFor("foo")).toEqual(DefaultIdentityManager);
    });

    test("it can register identity managers per db collection and for application", assert => {
      let FooIdentityManager = class {};
      let ApplicationIdentityManager = class {};

      let db = new Db();
      db.registerIdentityManagers({
        foo: FooIdentityManager,
        application: ApplicationIdentityManager
      });

      expect(db.identityManagerFor("foo")).toEqual(FooIdentityManager);
      expect(db.identityManagerFor("bar")).toEqual(ApplicationIdentityManager);
    });

    test("it can register idenitity managers on instantiation", assert => {
      let CustomIdentityManager = class {};
      let db = new Db(undefined, {
        foo: CustomIdentityManager
      });
      expect(db.identityManagerFor("foo")).toEqual(CustomIdentityManager);
      expect(db.identityManagerFor("bar")).toEqual(DefaultIdentityManager);
    });
  }
);
