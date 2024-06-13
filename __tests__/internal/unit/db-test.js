import "@lib/container";
import Db from "@lib/db";
import DefaultIdentityManager from "@lib/identity-manager";

let db;

describe("Unit | Db", function () {
  test("it can be instantiated", () => {
    db = new Db();
    expect(Db).toBeTruthy();
  });

  test("it can load data on instantiation", () => {
    db = new Db({
      users: [{ id: 1, name: "Link" }],
      addresses: [
        { id: 1, name: "123 Hyrule Way" },
        { id: 2, name: "Lorem ipsum" },
      ],
    });

    expect(db.users).toHaveLength(1);
    expect(db.addresses).toHaveLength(2);
  });

  test("it can empty its data", () => {
    db = new Db({
      users: [{ id: 1, name: "Link" }],
      addresses: [
        { id: 1, name: "123 Hyrule Way" },
        { id: 2, name: "Lorem ipsum" },
      ],
    });

    db.emptyData();

    expect(db.users).toHaveLength(0);
    expect(db.addresses).toHaveLength(0);
  });
});

describe("Unit | Db #createCollection", function () {
  beforeEach(function () {
    db = new Db();
  });

  afterEach(function () {
    db.emptyData();
  });

  test("it can create an empty collection", () => {
    db.createCollection("contacts");

    expect(db.contacts).toBeTruthy();
  });

  test("it can create many collections", () => {
    db.createCollections("contacts", "addresses");

    expect(db.contacts).toBeTruthy();
    expect(db.addresses).toBeTruthy();
  });
});

describe("Unit | Db #loadData", function () {
  beforeEach(function () {
    db = new Db();
  });

  afterEach(function () {
    db.emptyData();
  });

  test("it can load an object of data", () => {
    let data = {
      contacts: [{ id: "1", name: "Link" }],
      addresses: [{ id: "1", name: "123 Hyrule Way" }],
    };
    db.loadData(data);

    expect(db.contacts).toIncludeSameMembers(data.contacts);
    expect(db.addresses).toIncludeSameMembers(data.addresses);
  });

  test("it clones all data so nothing is passed by reference", () => {
    let data = {
      contacts: [{ id: "1", someArray: ["foo", "bar"] }],
    };
    db.loadData(data);

    let contactRecord = db.contacts.find(1);
    contactRecord.someArray.push("baz");

    expect(contactRecord.someArray).toHaveLength(3);
    expect(data.contacts[0].someArray).toHaveLength(2);
  });
});

describe("Unit | Db #all", function () {
  let data;

  beforeEach(function () {
    data = {
      contacts: [{ id: "1", name: "Link" }],
      addresses: [{ id: "1", name: "123 Hyrule Way" }],
    };

    db = new Db(data);
  });

  afterEach(function () {
    db.emptyData();
  });

  test("it can return a collection", () => {
    expect(db.contacts).toIncludeSameMembers(data.contacts);
    expect(db.addresses).toIncludeSameMembers(data.addresses);
  });

  test("the collection is a copy", () => {
    let { contacts } = db;

    expect(contacts).toIncludeSameMembers(data.contacts);
    contacts[0].name = "Zelda";

    expect(db.contacts).toIncludeSameMembers(data.contacts);
  });
});

describe("Unit | Db #insert", function () {
  beforeEach(function () {
    db = new Db();
    db.createCollection("contacts");
  });

  afterEach(function () {
    db.emptyData();
  });

  test("it inserts an object and returns it", () => {
    let link = db.contacts.insert({ name: "Link" });
    let expectedRecord = {
      id: "1",
      name: "Link",
    };

    expect(db.contacts).toIncludeSameMembers([expectedRecord]);
    expect(link).toEqual(expectedRecord);
  });

  test("it returns a copy", () => {
    let link = db.contacts.insert({ name: "Link" });
    let expectedRecord = {
      id: "1",
      name: "Link",
    };

    expect(link).toEqual(expectedRecord);

    link.name = "Young link";

    expect(db.contacts.find(1)).toEqual(expectedRecord);
  });

  test("it can insert objects sequentially", () => {
    db.contacts.insert({ name: "Link" });
    db.contacts.insert({ name: "Ganon" });

    let records = [
      { id: "1", name: "Link" },
      { id: "2", name: "Ganon" },
    ];

    expect(db.contacts).toIncludeSameMembers(records);
  });

  test("it does not add an id if present", () => {
    let attrs = { id: "5", name: "Link" };

    db.contacts.insert(attrs);

    expect(db.contacts).toIncludeSameMembers([attrs]);
  });

  test("it can insert an array and return it", () => {
    db.contacts.insert({ name: "Link" });

    let contacts = db.contacts.insert([{ name: "Zelda" }, { name: "Ganon" }]);

    expect(db.contacts).toIncludeSameMembers([
      { id: "1", name: "Link" },
      { id: "2", name: "Zelda" },
      { id: "3", name: "Ganon" },
    ]);
    expect(contacts).toIncludeSameMembers([
      { id: "2", name: "Zelda" },
      { id: "3", name: "Ganon" },
    ]);
  });

  test("it does not add ids to array data if present", () => {
    db.contacts.insert([
      { id: 2, name: "Link" },
      { id: 1, name: "Ganon" },
    ]);

    expect(db.contacts).toHaveLength(2);
    expect(db.contacts).toContainEqual({ id: "2", name: "Link" });
    expect(db.contacts).toContainEqual({ id: "1", name: "Ganon" });
  });

  test("it can insert a record with an id of 0", () => {
    db.contacts.insert({ id: 0, name: "Link" });

    expect(db.contacts).toHaveLength(1);
    expect(db.contacts).toContainEqual({ id: "0", name: "Link" });
  });

  test("IDs increment correctly, even after a record is removed", () => {
    let records = db.contacts.insert([{ name: "Link" }, { name: "Ganon" }]);

    db.contacts.remove(records[0]);

    let record = db.contacts.insert({ name: "Zelda" });

    expect(record.id).toBe("3");
  });

  test("inserting a record with an already used ID throws an error", () => {
    expect.assertions(2);

    db.contacts.insert({ id: 1, name: "Duncan McCleod" });

    expect(function () {
      db.contacts.insert({ id: 1, name: "Duncan McCleod" });
    }).toThrow();

    db.contacts.insert({ id: "atp", name: "Adenosine Triphosphate" });

    expect(function () {
      db.contacts.insert({ id: "atp", name: "Adenosine Triphosphate" });
    }).toThrow();
  });

  test("tracks the correct IDs being used", () => {
    db.contacts.insert({ name: "Vegeta" });
    db.contacts.insert({ id: 2, name: "Krilli" });

    expect(db.contacts).toHaveLength(2);
  });
});

describe("Unit | Db #findBy", function () {
  beforeEach(function () {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Zelda" },
      { name: "Link" },
      { name: "Epona", race: "Horse" },
      { name: "Epona", race: "Centaur" },
      { id: "abc", name: "Ganon" },
    ]);
  });

  afterEach(function () {
    db.emptyData();
  });

  test("returns a record that matches the given name", () => {
    let contact = db.contacts.findBy({ name: "Link" });

    expect(contact).toEqual({ id: "2", name: "Link" });
  });

  test("returns a copy not a reference", () => {
    let contact = db.contacts.findBy({ name: "Link" });

    contact.name = "blah";

    expect(db.contacts.find(2)).toEqual({ id: "2", name: "Link" });
  });

  test("returns the first record matching the criteria", () => {
    let contact = db.contacts.findBy({ name: "Epona" });

    expect(contact).toEqual({ id: "3", name: "Epona", race: "Horse" });
  });

  test("returns a record only matching multiple criteria", () => {
    let contact = db.contacts.findBy({ name: "Epona", race: "Centaur" });

    expect(contact).toEqual({ id: "4", name: "Epona", race: "Centaur" });
  });

  test("returns null when no record is found", () => {
    let contact = db.contacts.findBy({ name: "Fi" });

    expect(contact).toBeNull();
  });
});

describe("Unit | Db #find", function () {
  beforeEach(function () {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Zelda" },
      { name: "Link" },
      { id: "abc", name: "Ganon" },
    ]);
  });

  afterEach(function () {
    db.emptyData();
  });

  test("returns a record that matches a numerical id", () => {
    let contact = db.contacts.find(2);

    expect(contact).toEqual({ id: "2", name: "Link" });
  });

  test("returns a copy not a reference", () => {
    let contact = db.contacts.find(2);

    expect(contact).toEqual({ id: "2", name: "Link" });

    contact.name = "blah";

    expect(db.contacts.find(2)).toEqual({ id: "2", name: "Link" });
  });

  test("returns a record that matches a string id", () => {
    let contact = db.contacts.find("abc");

    expect(contact).toEqual({ id: "abc", name: "Ganon" });
  });

  test("returns multiple record that matches an array of ids", () => {
    let contacts = db.contacts.find([1, 2]);

    expect(contacts).toEqual([
      { id: "1", name: "Zelda" },
      { id: "2", name: "Link" },
    ]);
  });

  test("returns a record whose id is a string that start with numbers", () => {
    db.contacts.insert({
      id: "123-456",
      name: "Epona",
    });

    let contact = db.contacts.find("123-456");
    expect(contact).toEqual({ id: "123-456", name: "Epona" });
  });

  test("returns multiple record that match an array of ids", () => {
    let contacts = db.contacts.find([1, 2]);

    expect(contacts).toEqual([
      { id: "1", name: "Zelda" },
      { id: "2", name: "Link" },
    ]);
  });

  test("returns an empty array when it doesnt find multiple ids", () => {
    let contacts = db.contacts.find([99, 100]);

    expect(contacts).toEqual([]);
  });
});

describe("Unit | Db #where", function () {
  beforeEach(function () {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Link", evil: false, age: 17 },
      { name: "Zelda", evil: false, age: 17 },
      { name: "Ganon", evil: true, age: 45 },
    ]);
  });

  afterEach(function () {
    db.emptyData();
  });

  test("returns an array of records that match the query", () => {
    let result = db.contacts.where({ evil: true });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);
  });

  test("it coerces query params to strings", () => {
    let result = db.contacts.where({ age: "45" });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);
  });

  test("returns a copy, not a referecne", () => {
    let result = db.contacts.where({ evil: true });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);

    result[0].evil = false;

    expect(db.contacts.where({ evil: true })).toEqual([
      { id: "3", name: "Ganon", evil: true, age: 45 },
    ]);
  });

  test("returns an empty array if no records match the query", () => {
    let result = db.contacts.where({ name: "Link", evil: true });

    expect(result).toEqual([]);
  });

  test("accepts a filter function", () => {
    let result = db.contacts.where(function (record) {
      return record.age === 45;
    });

    expect(result).toEqual([{ id: "3", name: "Ganon", evil: true, age: 45 }]);
  });
});

describe("Unit | Db #update", function () {
  beforeEach(function () {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Link", evil: false },
      { name: "Zelda", evil: false },
      { name: "Ganon", evil: true },
      { id: "123-abc", name: "Epona", evil: false },
    ]);
  });

  afterEach(function () {
    db.emptyData();
  });

  test("it can update the whole collection", () => {
    db.contacts.update({ name: "Sam", evil: false });

    expect(db.contacts).toHaveLength(4);

    [
      { id: "1", name: "Sam", evil: false },
      { id: "2", name: "Sam", evil: false },
      { id: "3", name: "Sam", evil: false },
      { id: "123-abc", name: "Sam", evil: false },
    ].forEach((contact) => {
      expect(db.contacts).toContainEqual(contact);
    });
  });

  test("it can update a record by id", () => {
    db.contacts.update(3, { name: "Ganondorf", evil: false });
    let ganon = db.contacts.find(3);

    expect(ganon).toEqual({ id: "3", name: "Ganondorf", evil: false });
  });

  test("it can update a record by id when the id is a string", () => {
    db.contacts.update("123-abc", { evil: true });
    let epona = db.contacts.find("123-abc");

    expect(epona).toEqual({ id: "123-abc", name: "Epona", evil: true });
  });

  test("it can update multiple records by ids", () => {
    db.contacts.update([1, 2], { evil: true });
    let link = db.contacts.find(1);
    let zelda = db.contacts.find(2);

    expect(link.evil).toBe(true);
    expect(zelda.evil).toBe(true);
  });

  test("it can update records by query", () => {
    db.contacts.update({ evil: false }, { name: "Sam" });

    expect(db.contacts).toHaveLength(4);
    [
      { id: "1", name: "Sam", evil: false },
      { id: "2", name: "Sam", evil: false },
      { id: "3", name: "Ganon", evil: true },
      { id: "123-abc", name: "Sam", evil: false },
    ].forEach((contact) => {
      expect(db.contacts).toContainEqual(contact);
    });
  });

  test("updating a single record returns that record", () => {
    let ganon = db.contacts.update(3, { name: "Ganondorf" });
    expect(ganon).toEqual({ id: "3", name: "Ganondorf", evil: true });
  });

  test("updating a collection returns the updated records", () => {
    let characters = db.contacts.update({ evil: true });
    expect(characters).toEqual([
      { id: "1", name: "Link", evil: true },
      { id: "2", name: "Zelda", evil: true },
      { id: "123-abc", name: "Epona", evil: true },
    ]);
  });

  test("updating multiple records returns the updated records", () => {
    let characters = db.contacts.update({ evil: false }, { evil: true });
    expect(characters).toEqual([
      { id: "1", name: "Link", evil: true },
      { id: "2", name: "Zelda", evil: true },
      { id: "123-abc", name: "Epona", evil: true },
    ]);
  });

  test("throws when updating an ID is attempted", () => {
    expect.assertions(1);

    expect(function () {
      db.contacts.update(1, { id: 3 });
    }).toThrow();
  });
});

describe("Unit | Db #remove", function () {
  beforeEach(function () {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { name: "Link", evil: false },
      { name: "Zelda", evil: false },
      { name: "Ganon", evil: true },
      { id: "123-abc", name: "Epona", evil: false },
    ]);
  });

  afterEach(function () {
    db.emptyData();
  });

  test("it can remove an entire collection", () => {
    db.contacts.remove();

    expect(db.contacts).toHaveLength(0);
  });

  test("it can remove a single record by id", () => {
    db.contacts.remove(1);

    expect(db.contacts).toContainEqual({ id: "2", name: "Zelda", evil: false });
    expect(db.contacts).toContainEqual({ id: "3", name: "Ganon", evil: true });
    expect(db.contacts).toContainEqual({
      id: "123-abc",
      name: "Epona",
      evil: false,
    });
  });

  test("it can remove a single record when the id is a string", () => {
    db.contacts.remove("123-abc");

    expect(db.contacts).toHaveLength(3);
    expect(db.contacts).toContainEqual({ id: "1", name: "Link", evil: false });
    expect(db.contacts).toContainEqual({ id: "2", name: "Zelda", evil: false });
    expect(db.contacts).toContainEqual({ id: "3", name: "Ganon", evil: true });
  });

  test("it can remove multiple records by ids", () => {
    db.contacts.remove([1, 2]);

    expect(db.contacts).toHaveLength(2);
    expect(db.contacts).toContainEqual({ id: "3", name: "Ganon", evil: true });
    expect(db.contacts).toContainEqual({
      id: "123-abc",
      name: "Epona",
      evil: false,
    });
  });

  test("it can remove multiple records by query", () => {
    db.contacts.remove({ evil: false });

    expect(db.contacts).toHaveLength(1);
    expect(db.contacts).toContainEqual({ id: "3", name: "Ganon", evil: true });
  });

  test("it can add a record after removing all records", () => {
    db.contacts.remove();
    db.contacts.insert({ name: "Foo" });

    expect(db.contacts).toHaveLength(1);
    expect(db.contacts).toContainEqual({ id: "1", name: "Foo" });
  });
});

describe("Unit | Db #firstOrCreate", function () {
  beforeEach(function () {
    db = new Db();
    db.createCollection("contacts");
    db.contacts.insert([
      { id: 1, name: "Link", evil: false },
      { id: 2, name: "Zelda", evil: false },
      { id: 3, name: "Ganon", evil: true },
    ]);
  });

  afterEach(function () {
    db.emptyData();
  });

  test("it can find the first record available from the query", () => {
    let record = db.contacts.firstOrCreate({ name: "Link" });

    expect(record).toEqual({ id: "1", name: "Link", evil: false });
  });

  test("it creates a new record from query + attrs if none found", () => {
    let record = db.contacts.firstOrCreate({ name: "Mario" }, { evil: false });

    expect(record.name).toBe("Mario");
    expect(record.evil).toBe(false);
    expect(record.id).toBeTruthy();
  });

  test("does not require attrs", () => {
    let record = db.contacts.firstOrCreate({ name: "Luigi" });

    expect(record.name).toBe("Luigi");
    expect(record.id).toBeTruthy();
  });
});

describe("Unit | Db #registerIdentityManagers and #identityManagerFor", function () {
  test("identityManagerFor returns default IdentityManager if there aren't any custom ones", () => {
    let db = new Db();
    expect(db.identityManagerFor("foo")).toEqual(DefaultIdentityManager);
  });

  test("it can register identity managers per db collection and for application", () => {
    let FooIdentityManager = class {};
    let ApplicationIdentityManager = class {};

    let db = new Db();
    db.registerIdentityManagers({
      foo: FooIdentityManager,
      application: ApplicationIdentityManager,
    });

    expect(db.identityManagerFor("foo")).toEqual(FooIdentityManager);
    expect(db.identityManagerFor("bar")).toEqual(ApplicationIdentityManager);
  });

  test("it can register idenitity managers on instantiation", () => {
    let CustomIdentityManager = class {};
    let db = new Db(undefined, {
      foo: CustomIdentityManager,
    });
    expect(db.identityManagerFor("foo")).toEqual(CustomIdentityManager);
    expect(db.identityManagerFor("bar")).toEqual(DefaultIdentityManager);
  });
});
