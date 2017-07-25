import Db from 'ember-cli-mirage/db';
import DefaultIdentityManager from 'ember-cli-mirage/identity-manager';

import {module, test} from 'qunit';

let db;
module('Unit | Db');

test('it can be instantiated', function(assert) {
  db = new Db();
  assert.ok(db);
});

test('it can load data on instantiation', function(assert) {
  db = new Db({
    users: [{ id: 1, name: 'Link' }],
    addresses: [{ id: 1, name: '123 Hyrule Way' }, { id: 2, name: 'Lorem ipsum' }]
  });

  assert.equal(db.users.length, 1);
  assert.equal(db.addresses.length, 2);
});

test('it can empty its data', function(assert) {
  db = new Db({
    users: [{ id: 1, name: 'Link' }],
    addresses: [{ id: 1, name: '123 Hyrule Way' }, { id: 2, name: 'Lorem ipsum' }]
  });

  db.emptyData();

  assert.equal(db.users.length, 0);
  assert.equal(db.addresses.length, 0);
});

module('Unit | Db #createCollection', {
  beforeEach() {
    db = new Db();
  },
  afterEach() {
    db.emptyData();
  }
});

test('it can create an empty collection', function(assert) {
  db.createCollection('contacts');

  assert.ok(db.contacts);
});

test('it can create many collections', function(assert) {
  db.createCollections('contacts', 'addresses');

  assert.ok(db.contacts);
  assert.ok(db.addresses);
});

module('Unit | Db #loadData', {
  beforeEach() {
    db = new Db();
  },
  afterEach() {
    db.emptyData();
  }
});

test('it can load an object of data', function(assert) {
  let data = {
    contacts: [{ id: '1', name: 'Link' }],
    addresses: [{ id: '1', name: '123 Hyrule Way' }]
  };
  db.loadData(data);

  assert.deepEqual(db.contacts, data.contacts);
  assert.deepEqual(db.addresses, data.addresses);
});

test("it clones all data so nothing is passed by reference", function(assert) {
  let data = {
    contacts: [{ id: '1', someArray: ['foo', 'bar'] }]
  };
  db.loadData(data);

  let contactRecord = db.contacts.find(1);
  contactRecord.someArray.push('baz');

  assert.equal(contactRecord.someArray.length, 3);
  assert.equal(data.contacts[0].someArray.length, 2);
});

module('Unit | Db #all', {
  beforeEach() {
    this.data = {
      contacts: [{ id: '1', name: 'Link' }],
      addresses: [{ id: '1', name: '123 Hyrule Way' }]
    };

    db = new Db(this.data);
  },
  afterEach() {
    db.emptyData();
  }
});

test('it can return a collection', function(assert) {
  assert.deepEqual(db.contacts, this.data.contacts);
  assert.deepEqual(db.addresses, this.data.addresses);
});

test('the collection is a copy', function(assert) {
  let { contacts } = db;

  assert.deepEqual(contacts, this.data.contacts);
  contacts[0].name = 'Zelda';

  assert.deepEqual(db.contacts, this.data.contacts);
});

module('Unit | Db #insert', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
  },

  afterEach() {
    db.emptyData();
  }
});

test('it inserts an object and returns it', function(assert) {
  let link = db.contacts.insert({ name: 'Link' });
  let expectedRecord = {
    id: '1',
    name: 'Link'
  };

  assert.deepEqual(db.contacts, [expectedRecord]);
  assert.deepEqual(link, expectedRecord);
});

test('it returns a copy', function(assert) {
  let link = db.contacts.insert({ name: 'Link' });
  let expectedRecord = {
    id: '1',
    name: 'Link'
  };

  assert.deepEqual(link, expectedRecord);

  link.name = 'Young link';

  assert.deepEqual(db.contacts.find(1), expectedRecord);
});

test('it can insert objects sequentially', function(assert) {
  db.contacts.insert({ name: 'Link' });
  db.contacts.insert({ name: 'Ganon' });

  let records = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Ganon' }
  ];

  assert.deepEqual(db.contacts, records);
});

test('it does not add an id if present', function(assert) {
  let attrs = { id: '5', name: 'Link' };

  db.contacts.insert(attrs);

  assert.deepEqual(db.contacts, [attrs]);
});

test('it can insert an array and return it', function(assert) {
  db.contacts.insert({ name: 'Link' });

  let contacts = db.contacts.insert([{ name: 'Zelda' }, { name: 'Ganon' }]);

  assert.deepEqual(db.contacts, [{ id: '1', name: 'Link' }, { id: '2', name: 'Zelda' }, { id: '3', name: 'Ganon' }]);
  assert.deepEqual(contacts, [{ id: '2', name: 'Zelda' }, { id: '3', name: 'Ganon' }]);
});

test('it does not add ids to array data if present', function(assert) {
  db.contacts.insert([{ id: 2, name: 'Link' }, { id: 1, name: 'Ganon' }]);

  assert.deepEqual(db.contacts, [{ id: '1', name: 'Ganon' }, { id: '2', name: 'Link' }]);
});

test('it can insert a record with an id of 0', function(assert) {
  db.contacts.insert({ id: 0, name: 'Link' });

  assert.deepEqual(db.contacts, [{ id: '0', name: 'Link' }]);
});

test('IDs increment correctly, even after a record is removed', function(assert) {
  let records = db.contacts.insert([{ name: 'Link' }, { name: 'Ganon' }]);

  db.contacts.remove(records[0]);

  let record = db.contacts.insert({ name: 'Zelda' });

  assert.equal(record.id, 3);
});

test('inserting a record with an already used ID throws an error', function(assert) {
  assert.expect(2);

  db.contacts.insert({ id: 1, name: 'Duncan McCleod' });

  assert.throws(function() {
    db.contacts.insert({ id: 1, name: 'Duncan McCleod' });
  });

  db.contacts.insert({ id: 'atp', name: 'Adenosine Triphosphate' });

  assert.throws(function() {
    db.contacts.insert({ id: 'atp', name: 'Adenosine Triphosphate' });
  });
});

test('tracks the correct IDs being used', function(assert) {
  db.contacts.insert({ name: 'Vegeta' });
  db.contacts.insert({ id: 2, name: 'Krilli' });

  assert.equal(db.contacts.length, 2);
});

module('Unit | Db #findBy', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      { name: 'Zelda' },
      { name: 'Link' },
      { name: 'Epona', race: 'Horse' },
      { name: 'Epona', race: 'Centaur' },
      { id: 'abc', name: 'Ganon' }
    ]);
  },
  afterEach() {
    db.emptyData();
  }
});

test('returns a record that matches the given name', function(assert) {
  let contact = db.contacts.findBy({ 'name': 'Link' });

  assert.deepEqual(contact, { id: '2', name: 'Link' });
});

test('returns a copy not a reference', function(assert) {
  let contact = db.contacts.findBy({ 'name': 'Link' });

  contact.name = 'blah';

  assert.deepEqual(db.contacts.find(2), { id: '2', name: 'Link' });
});

test('returns the first record matching the criteria', function(assert) {
  let contact = db.contacts.findBy({ 'name': 'Epona' });

  assert.deepEqual(contact, { id: '3', name: 'Epona', race: 'Horse' });
});

test('returns a record only matching multiple criteria', function(assert) {
  let contact = db.contacts.findBy({ 'name': 'Epona', 'race': 'Centaur' });

  assert.deepEqual(contact, { id: '4', name: 'Epona', race: 'Centaur' });
});

test('returns null when no record is found', function(assert) {
  let contact = db.contacts.findBy({ 'name': 'Fi' });

  assert.equal(contact, null);
});

module('Unit | Db #find', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      { name: 'Zelda' },
      { name: 'Link' },
      { id: 'abc', name: 'Ganon' }
    ]);
  },
  afterEach() {
    db.emptyData();
  }
});

test('returns a record that matches a numerical id', function(assert) {
  let contact = db.contacts.find(2);

  assert.deepEqual(contact, { id: '2', name: 'Link' });
});

test('returns a copy not a reference', function(assert) {
  let contact = db.contacts.find(2);

  assert.deepEqual(contact, { id: '2', name: 'Link' });

  contact.name = 'blah';

  assert.deepEqual(db.contacts.find(2), { id: '2', name: 'Link' });
});

test('returns a record that matches a string id', function(assert) {
  let contact = db.contacts.find('abc');

  assert.deepEqual(contact, { id: 'abc', name: 'Ganon' });
});

test('returns multiple record that matches an array of ids', function(assert) {
  let contacts = db.contacts.find([1, 2]);

  assert.deepEqual(contacts, [{ id: '1', name: 'Zelda' }, { id: '2', name: 'Link' }]);
});

test('returns a record whose id is a string that start with numbers', function(assert) {
  db.contacts.insert({
    id: '123-456',
    name: 'Epona'
  });

  let contact = db.contacts.find('123-456');
  assert.deepEqual(contact, { id: '123-456', name: 'Epona' });
});

test('returns multiple record that match an array of ids', function(assert) {
  let contacts = db.contacts.find([1, 2]);

  assert.deepEqual(contacts, [{ id: '1', name: 'Zelda' }, { id: '2', name: 'Link' }]);
});

test('returns an empty array when it doesnt find multiple ids', function(assert) {
  let contacts = db.contacts.find([99, 100]);

  assert.deepEqual(contacts, []);
});

module('Unit | Db #where', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      { name: 'Link',  evil: false, age: 17 },
      { name: 'Zelda', evil: false, age: 17 },
      { name: 'Ganon', evil: true,  age: 45 }
    ]);
  },
  afterEach() {
    db.emptyData();
  }
});

test('returns an array of records that match the query', function(assert) {
  let result = db.contacts.where({ evil: true });

  assert.deepEqual(result, [
    { id: '3', name: 'Ganon', evil: true, age: 45 }
  ]);
});

test('it coerces query params to strings', function(assert) {
  let result = db.contacts.where({ age: '45' });

  assert.deepEqual(result, [
    { id: '3', name: 'Ganon', evil: true, age: 45 }
  ]);
});

test('returns a copy, not a referecne', function(assert) {
  let result = db.contacts.where({ evil: true });

  assert.deepEqual(result, [
    { id: '3', name: 'Ganon', evil: true, age: 45 }
  ]);

  result[0].evil = false;

  assert.deepEqual(db.contacts.where({ evil: true }), [
    { id: '3', name: 'Ganon', evil: true, age: 45 }
  ]);
});

test('returns an empty array if no records match the query', function(assert) {
  let result = db.contacts.where({ name: 'Link', evil: true });

  assert.deepEqual(result, []);
});

test('accepts a filter function', function(assert) {
  let result = db.contacts.where(function(record) {
    return record.age === 45;
  });

  assert.deepEqual(result, [
    { id: '3', name: 'Ganon', evil: true, age: 45 }
  ]);
});

module('Unit | Db #update', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      { name: 'Link', evil: false },
      { name: 'Zelda', evil: false },
      { name: 'Ganon', evil: true },
      { id: '123-abc', name: 'Epona', evil: false }
    ]);
  },
  afterEach() {
    db.emptyData();
  }
});

test('it can update the whole collection', function(assert) {
  db.contacts.update({ name: 'Sam', evil: false });

  let actualContacts = db.contacts;

  let expectedContacts = [
    { id: '123-abc', name: 'Sam', evil: false },
    { id: '1', name: 'Sam', evil: false },
    { id: '2', name: 'Sam', evil: false },
    { id: '3', name: 'Sam', evil: false }
  ];

  assert.deepEqual(
    actualContacts, expectedContacts, [actualContacts.map(function(r) {
      return r.id;
    }).join(','), expectedContacts.map(function(r) {
      return r.id;
    }).join(',')].join(';')
  );
});

test('it can update a record by id', function(assert) {
  db.contacts.update(3, { name: 'Ganondorf', evil: false });
  let ganon = db.contacts.find(3);

  assert.deepEqual(ganon, { id: '3', name: 'Ganondorf', evil: false });
});

test('it can update a record by id when the id is a string', function(assert) {
  db.contacts.update('123-abc', { evil: true });
  let epona = db.contacts.find('123-abc');

  assert.deepEqual(epona, { id: '123-abc', name: 'Epona', evil: true });
});

test('it can update multiple records by ids', function(assert) {
  db.contacts.update([1, 2], { evil: true });
  let link = db.contacts.find(1);
  let zelda = db.contacts.find(2);

  assert.equal(link.evil, true);
  assert.equal(zelda.evil, true);
});

test('it can update records by query', function(assert) {
  db.contacts.update({ evil: false }, { name: 'Sam' });

  assert.deepEqual(db.contacts, [
    { id: '123-abc', name: 'Sam', evil: false },
    { id: '1', name: 'Sam', evil: false },
    { id: '2', name: 'Sam', evil: false },
    { id: '3', name: 'Ganon', evil: true }
  ]);
});

test('updating a single record returns that record', function(assert) {
  let ganon = db.contacts.update(3, { name: 'Ganondorf' });
  assert.deepEqual(ganon, { id: '3', name: 'Ganondorf', evil: true });
});

test('updating a collection returns the updated records', function(assert) {
  let characters = db.contacts.update({ evil: true });
  assert.deepEqual(characters, [
    { id: '123-abc', name: 'Epona', evil: true },
    { id: '1', name: 'Link', evil: true },
    { id: '2', name: 'Zelda', evil: true }
  ]);
});

test('updating multiple records returns the updated records', function(assert) {
  let characters = db.contacts.update({ evil: false }, { evil: true });
  assert.deepEqual(characters, [
    { id: '123-abc', name: 'Epona', evil: true },
    { id: '1', name: 'Link', evil: true },
    { id: '2', name: 'Zelda', evil: true }
  ]);
});

test('throws when updating an ID is attempted', function(assert) {
  assert.expect(1);

  assert.throws(function() {
    db.contacts.update(1, { id: 3 });
  });
});

module('Unit | Db #remove', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      { name: 'Link', evil: false },
      { name: 'Zelda', evil: false },
      { name: 'Ganon', evil: true },
      { id: '123-abc', name: 'Epona', evil: false }
    ]);
  },

  afterEach() {
    db.emptyData();
  }
});

test('it can remove an entire collection', function(assert) {
  db.contacts.remove();

  assert.deepEqual(db.contacts, []);
});

test('it can remove a single record by id', function(assert) {
  db.contacts.remove(1);

  assert.deepEqual(db.contacts, [
    { id: '123-abc', name: 'Epona', evil: false },
    { id: '2', name: 'Zelda', evil: false },
    { id: '3', name: 'Ganon', evil: true }
  ]);
});

test('it can remove a single record when the id is a string', function(assert) {
  db.contacts.remove('123-abc');

  assert.deepEqual(db.contacts, [
    { id: '1', name: 'Link', evil: false },
    { id: '2', name: 'Zelda', evil: false },
    { id: '3', name: 'Ganon', evil: true }
  ]);
});

test('it can remove multiple records by ids', function(assert) {
  db.contacts.remove([1, 2]);

  assert.deepEqual(db.contacts, [
    { id: '123-abc', name: 'Epona', evil: false },
    { id: '3', name: 'Ganon', evil: true }
  ]);
});

test('it can remove multiple records by query', function(assert) {
  db.contacts.remove({ evil: false });

  assert.deepEqual(db.contacts, [
    { id: '3', name: 'Ganon', evil: true }
  ]);
});

test('it can add a record after removing all records', function(assert) {
  db.contacts.remove();
  db.contacts.insert({ name: 'Foo' });

  assert.equal(db.contacts.length, 1);
  assert.deepEqual(db.contacts, [
    { id: '1', name: 'Foo' }
  ]);
});

module('Unit | Db #firstOrCreate', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      { id: 1, name: 'Link', evil: false },
      { id: 2, name: 'Zelda', evil: false },
      { id: 3, name: 'Ganon', evil: true }
    ]);
  },

  afterEach() {
    db.emptyData();
  }
});

test('it can find the first record available from the query', function(assert) {
  let record = db.contacts.firstOrCreate({ name: 'Link' });

  assert.deepEqual(record, { id: '1', name: 'Link', evil: false });
});

test('it creates a new record from query + attrs if none found', function(assert) {
  let record = db.contacts.firstOrCreate({ name: 'Mario' }, { evil: false });

  assert.equal(record.name, 'Mario');
  assert.equal(record.evil, false);
  assert.ok(record.id);
});

test('does not require attrs', function(assert) {
  let record = db.contacts.firstOrCreate({ name: 'Luigi' });

  assert.equal(record.name, 'Luigi');
  assert.ok(record.id);
});

module('Unit | Db #registerIdentityManagers and #identityManagerFor');

test('identityManagerFor returns ember-cli-mirage default IdentityManager if there aren\'t any custom ones', function(assert) {
  let db = new Db();
  assert.equal(db.identityManagerFor('foo'), DefaultIdentityManager);
});

test('it can register identity managers per db collection and for application', function(assert) {
  let FooIdentityManager = class {};
  let ApplicationIdentityManager = class {};

  let db = new Db();
  db.registerIdentityManagers({
    foo: FooIdentityManager,
    application: ApplicationIdentityManager
  });

  assert.equal(
    db.identityManagerFor('foo'),
    FooIdentityManager,
    'it allows to declare an identity manager per db collection'
  );
  assert.equal(
    db.identityManagerFor('bar'),
    ApplicationIdentityManager,
    'it falls back to application idenitity manager if there isn\'t one for a specific db collection'
  );
});

test('it can register idenitity managers on instantiation', function(assert) {
  let CustomIdentityManager = class {};
  let db = new Db(undefined, {
    foo: CustomIdentityManager
  });
  assert.equal(db.identityManagerFor('foo'), CustomIdentityManager);
  assert.equal(db.identityManagerFor('bar'), DefaultIdentityManager);
});
