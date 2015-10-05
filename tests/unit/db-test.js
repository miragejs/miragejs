import Db from 'ember-cli-mirage/db';

import {module, test} from 'qunit';

var db;
module('Unit | Db');

test('it can be instantiated', function(assert) {
  db = new Db();
  assert.ok(db);
});

test('it can load data on instantiation', function(assert) {
  db = new Db({
    users: [{id: 1, name: 'Link'}],
    addresses: [{id: 1, name: '123 Hyrule Way'}, {id: 2, name: 'Lorem ipsum'}]
  });

  assert.equal(db.users.length, 1);
  assert.equal(db.addresses.length, 2);
});

test('it can empty its data', function(assert) {
  db = new Db({
    users: [{id: 1, name: 'Link'}],
    addresses: [{id: 1, name: '123 Hyrule Way'}, {id: 2, name: 'Lorem ipsum'}]
  });

  db.emptyData();

  assert.equal(db.users.length, 0);
  assert.equal(db.addresses.length, 0);
});

module('Unit | Db #createCollection', {
  beforeEach: function() {
    db = new Db();
  },
  afterEach: function() {
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
  beforeEach: function() {
    db = new Db();
  },
  afterEach: function() {
    db.emptyData();
  }
});

test('it can load an object of data', function(assert) {
  var data = {
    contacts: [{id: 1, name: 'Link'}],
    addresses: [{id: 1, name: '123 Hyrule Way'}]
  };
  db.loadData(data);

  assert.deepEqual(db.contacts, data.contacts);
  assert.deepEqual(db.addresses, data.addresses);
});

module('Unit | Db #all', {
  beforeEach: function() {
    this.data = {
      contacts: [{id: 1, name: 'Link'}],
      addresses: [{id: 1, name: '123 Hyrule Way'}]
    };

    db = new Db(this.data);
  },
  afterEach: function() {
    db.emptyData();
  }
});

test('it can return a collection', function(assert) {
  assert.deepEqual(db.contacts, this.data.contacts);
  assert.deepEqual(db.addresses, this.data.addresses);
});

test('the collection is a copy', function(assert) {
  var contacts = db.contacts;

  assert.deepEqual(contacts, this.data.contacts);
  contacts[0].name = 'Zelda';

  assert.deepEqual(db.contacts, this.data.contacts);
});

module('Unit | Db #insert', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
  },
  afterEach: function() {
    db.emptyData();
  }
});

test('it inserts an object and returns it', function(assert) {
  var link = db.contacts.insert({name: 'Link'});

  assert.deepEqual(db.contacts, [{id: 1, name: 'Link'}]);
  assert.deepEqual(link, {id: 1, name: 'Link'});
});

test('it returns a copy', function(assert) {
  var link = db.contacts.insert({name: 'Link'});

  assert.deepEqual(link, {id: 1, name: 'Link'});

  link.name = 'Young link';

  assert.deepEqual(db.contacts.find(1), {id: 1, name: 'Link'});
});

test('it can insert objects sequentially', function(assert) {
  db.contacts.insert({name: 'Link'});
  db.contacts.insert({name: 'Ganon'});

  assert.deepEqual(db.contacts, [{id: 1, name: 'Link'}, {id: 2, name: 'Ganon'}]);
});

test('it does not add an id if present', function(assert) {
  db.contacts.insert({id: 5, name: 'Link'});

  assert.deepEqual(db.contacts, [{id: 5, name: 'Link'}]);
});

test('it can insert an array and return it', function(assert) {
  db.contacts.insert({name: 'Link'});
  var contacts = db.contacts.insert([{name: 'Zelda'}, {name: 'Ganon'}]);

  assert.deepEqual(db.contacts, [{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}, {id: 3, name: 'Ganon'}]);
  assert.deepEqual(contacts, [{id: 2, name: 'Zelda'}, {id: 3, name: 'Ganon'}]);
});

test('it does not add ids to array data if present', function(assert) {
  db.contacts.insert([{id: 2, name: 'Link'}, {id: 1, name: 'Ganon'}]);

  assert.deepEqual(db.contacts, [{id: 2, name: 'Link'}, {id: 1, name: 'Ganon'}]);
});

test('it can insert a record with an id of 0', function(assert) {
  db.contacts.insert({id: 0, name: 'Link'});

  assert.deepEqual(db.contacts, [{id: 0, name: 'Link'}]);
});


module('Unit | Db #find', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Zelda'},
      {id: 2, name: 'Link'},
      {id: 'abc', name: 'Ganon'}
    ]);
  },
  afterEach: function() {
    db.emptyData();
  }
});

test('returns a record that matches a numerical id', function(assert) {
  var contact = db.contacts.find(2);

  assert.deepEqual(contact, {id: 2, name: 'Link'});
});

test('returns a copy not a reference', function(assert) {
  var contact = db.contacts.find(2);

  assert.deepEqual(contact, {id: 2, name: 'Link'});

  contact.name = 'blah';

  assert.deepEqual(db.contacts.find(2), {id: 2, name: 'Link'});
});

test('coerces interger-like ids to integers', function(assert) {
  var contact = db.contacts.find('2');

  assert.deepEqual(contact, {id: 2, name: 'Link'});
});

test('returns a record that matches a string id', function(assert) {
  var contact = db.contacts.find('abc');

  assert.deepEqual(contact, {id: 'abc', name: 'Ganon'});
});

test('returns multiple record that matche an arrya of ids', function(assert) {
  var contacts = db.contacts.find([1, 2]);

  assert.deepEqual(contacts, [{id: 1, name: 'Zelda'}, {id: 2, name: 'Link'}]);
});

test('returns a record whose id is a string that start with numbers', function(assert) {
  db.contacts.insert({
    id: '123-456',
    name: 'Epona'
  });

  var contact = db.contacts.find('123-456');
  assert.deepEqual(contact, {id: '123-456', name: 'Epona'});
});

test('returns multiple record that match an array of ids', function(assert) {
  var contacts = db.contacts.find([1, 2]);

  assert.deepEqual(contacts, [{id: 1, name: 'Zelda'}, {id: 2, name: 'Link'}]);
});

test('returns an empty array when it doesnt find multiple ids', function(assert) {
  var contacts = db.contacts.find([99, 100]);

  assert.deepEqual(contacts, []);
});


module('Unit | Db #where', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      { name: 'Link',  evil: false, age: 17 },
      { name: 'Zelda', evil: false, age: 17 },
      { name: 'Ganon', evil: true,  age: 45 }
    ]);
  },
  afterEach: function() {
    db.emptyData();
  }
});

test('returns an array of records that match the query', function(assert) {
  var result = db.contacts.where({evil: true});

  assert.deepEqual(result, [
    {id: 3, name: 'Ganon', evil: true, age: 45}
  ]);
});

test('it coerces query params to strings', function(assert) {
  var result = db.contacts.where({age: '45'});

  assert.deepEqual(result, [
    {id: 3, name: 'Ganon', evil: true, age: 45}
  ]);
});

test('returns a copy, not a referecne', function(assert) {
  var result = db.contacts.where({evil: true});

  assert.deepEqual(result, [
    {id: 3, name: 'Ganon', evil: true, age: 45}
  ]);

  result[0].evil = false;

  assert.deepEqual(db.contacts.where({evil: true}), [
    {id: 3, name: 'Ganon', evil: true, age: 45}
  ]);
});

test('returns an empty array if no records match the query', function(assert) {
  var result = db.contacts.where({name: 'Link', evil: true});

  assert.deepEqual(result, []);
});


module('Unit | Db #update', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true},
      {id: '123-abc', name: 'Epona', evil: false}
    ]);
  },
  afterEach: function() {
    db.emptyData();
  }
});

test('it can update the whole collection', function(assert) {
  db.contacts.update({name: 'Sam', evil: false});

  assert.deepEqual(db.contacts, [
    {id: 1, name: 'Sam', evil: false},
    {id: 2, name: 'Sam', evil: false},
    {id: 3, name: 'Sam', evil: false},
    {id: '123-abc', name: 'Sam', evil: false}
  ]);
});

test('it can update a record by id', function(assert) {
  db.contacts.update(3, {name: 'Ganondorf', evil: false});
  var ganon = db.contacts.find(3);

  assert.deepEqual(ganon, {id: 3, name: 'Ganondorf', evil: false});
});

test('it can update a record by id when the id is a string', function(assert) {
  db.contacts.update('123-abc', { evil: true });
  var epona = db.contacts.find('123-abc');

  assert.deepEqual(epona, {id: '123-abc', name: 'Epona', evil: true});
});

test('it can update multiple records by ids', function(assert) {
  db.contacts.update([1, 2], {evil: true});
  var link = db.contacts.find(1);
  var zelda = db.contacts.find(2);

  assert.equal(link.evil, true);
  assert.equal(zelda.evil, true);
});


test('it can update records by query', function(assert) {
  db.contacts.update({evil: false}, {name: 'Sam'});

  assert.deepEqual(db.contacts, [
    {id: 1, name: 'Sam', evil: false},
    {id: 2, name: 'Sam', evil: false},
    {id: 3, name: 'Ganon', evil: true},
    {id: '123-abc', name: 'Sam', evil: false}
  ]);
});

test('updating a single record returns that record', function(assert) {
  var ganon = db.contacts.update(3, {name: 'Ganondorf'});
  assert.deepEqual(ganon, {id: 3, name: 'Ganondorf', evil: true});
});

test('updating a collection returns the updated records', function(assert) {
  var characters = db.contacts.update({evil: true});
  assert.deepEqual(characters, [
    {id: 1, name: 'Link', evil: true},
    {id: 2, name: 'Zelda', evil: true},
    {id: '123-abc', name: 'Epona', evil: true}
  ]);
});

test('updating multiple records returns the updated records', function(assert) {
  var characters = db.contacts.update({evil: false}, {evil: true});
  assert.deepEqual(characters, [
    {id: 1, name: 'Link', evil: true},
    {id: 2, name: 'Zelda', evil: true},
    {id: '123-abc', name: 'Epona', evil: true}
  ]);
});


module('Unit | Db #remove', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true},
      {id: '123-abc', name: 'Epona', evil: false}
    ]);
  },
  afterEach: function() {
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
    {id: 2, name: 'Zelda', evil: false},
    {id: 3, name: 'Ganon', evil: true},
    {id: '123-abc', name: 'Epona', evil: false}
  ]);
});

test('it can remove a single record when the id is a string', function(assert) {
  db.contacts.remove('123-abc');

  assert.deepEqual(db.contacts, [
    {id: 1, name: 'Link', evil: false},
    {id: 2, name: 'Zelda', evil: false},
    {id: 3, name: 'Ganon', evil: true},
  ]);
});

test('it can remove multiple records by ids', function(assert) {
  db.contacts.remove([1, 2]);

  assert.deepEqual(db.contacts, [
    {id: 3, name: 'Ganon', evil: true},
    {id: '123-abc', name: 'Epona', evil: false}
  ]);
});

test('it can remove multiple records by query', function(assert) {
  db.contacts.remove({evil: false});

  assert.deepEqual(db.contacts, [
    {id: 3, name: 'Ganon', evil: true},
  ]);
});

test('it can add a record after removing all records', function(assert) {
  db.contacts.remove();
  db.contacts.insert({name: 'Foo'});

  assert.equal(db.contacts.length, 1);
  assert.deepEqual(db.contacts, [
    {id: 1, name: 'Foo'}
  ]);
});

module('Unit | Db #firstOrCreate', {
  beforeEach() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true},
    ]);
  },

  afterEach() {
    db.emptyData();
  }
});

test('it can find the first record available from the query', function(assert) {
  let record = db.contacts.firstOrCreate({ name: 'Link' });

  assert.deepEqual(record, { id: 1, name: 'Link', evil: false });
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
