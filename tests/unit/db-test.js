import Db from 'ember-cli-mirage/db';

import {module, test} from 'qunit';

var db;
module('mirage:db');

test('it can be instantiated', function(assert) {
  db = new Db();
  assert.ok(db);
});


module('mirage:db#createCollection', {
  beforeEach: function() {
    db = new Db();
  },
  afterEach: function() {
    db.emptyData();
  }
});

test('it can create an empty collection', function(assert) {
  db.createCollection('contacts');

  assert.deepEqual(db.contacts, []);
});

test('it can create many collections', function(assert) {
  db.createCollections('contacts', 'addresses');

  assert.deepEqual(db.contacts, []);
  assert.deepEqual(db.addresses, []);
});


module('mirage:db#loadData', {
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


module('mirage:db#insert', {
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


module('mirage:db#find', {
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


module('mirage:db#where', {
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
  var result = db.contacts.where({age: "45"});

  assert.deepEqual(result, [
    {id: 3, name: 'Ganon', evil: true, age: 45}
  ]);
});

test('returns an empty array if no records match the query', function(assert) {
  var result = db.contacts.where({name: 'Link', evil: true});

  assert.deepEqual(result, []);
});


module('mirage:db#update', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true}
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
    {id: 3, name: 'Sam', evil: false}
  ]);
});

test('it can update a record by id', function(assert) {
  db.contacts.update(3, {name: 'Ganondorf', evil: false});
  var ganon = db.contacts.find(3);

  assert.deepEqual(ganon, {id: 3, name: 'Ganondorf', evil: false});
});

test('it can update a record by id when the id is a string', function(assert) {
  db.contacts.insert({id: '123-abc', name: 'Epona', evil: true});
  db.contacts.update('123-abc', { name: 'Epona', evil: false });

  var epona = db.contacts.find('123-abc');

  assert.deepEqual(epona, {id: '123-abc', name: 'Epona', evil: false});
});

test('it can update records by query', function(assert) {
  db.contacts.update({evil: false}, {name: 'Sam'});

  assert.deepEqual(db.contacts, [
    {id: 1, name: 'Sam', evil: false},
    {id: 2, name: 'Sam', evil: false},
    {id: 3, name: 'Ganon', evil: true}
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
    {id: 3, name: 'Ganon', evil: true}
  ]);
});

test('updating multiple records returns the updated records', function(assert) {
  var characters = db.contacts.update({evil: false}, {evil: true});
  assert.deepEqual(characters, [
    {id: 1, name: 'Link', evil: true},
    {id: 2, name: 'Zelda', evil: true}
  ]);
});


module('mirage:db#remove', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true}
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

test('it can remove a single record', function(assert) {
  db.contacts.remove(1);

  assert.deepEqual(db.contacts, [
    {id: 2, name: 'Zelda', evil: false},
    {id: 3, name: 'Ganon', evil: true},
  ]);
});

test('it can remove a single record then the id is a string', function(assert) {
  db.contacts.insert({id: '123-abc', name: 'Epona', evil: true});
  db.contacts.remove('123-abc');

  assert.deepEqual(db.contacts, [
    {id: 1, name: 'Link', evil: false},
    {id: 2, name: 'Zelda', evil: false},
    {id: 3, name: 'Ganon', evil: true},
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
