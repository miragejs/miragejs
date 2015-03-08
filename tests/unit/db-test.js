import Db from 'ember-cli-mirage/db';

var db;
module('mirage:db');

test('it can be instantiated', function() {
  db = new Db();
  ok(db);
});


module('mirage:db#createCollection', {
  setup: function() {
    db = new Db();
  },
  teardown: function() {
    db.emptyData();
  }
});

test('it can create an empty collection', function() {
  db.createCollection('contacts');

  deepEqual(db.contacts, []);
});


module('mirage:db#insert', {
  setup: function() {
    db = new Db();
    db.createCollection('contacts');
  },
  teardown: function() {
    db.emptyData();
  }
});

test('it inserts an object and returns it', function() {
  var link = db.contacts.insert({name: 'Link'});

  deepEqual(db.contacts, [{id: 1, name: 'Link'}]);
  deepEqual(link, {id: 1, name: 'Link'});
});

test('it can insert objects sequentially', function() {
  db.contacts.insert({name: 'Link'});
  db.contacts.insert({name: 'Ganon'});

  deepEqual(db.contacts, [{id: 1, name: 'Link'}, {id: 2, name: 'Ganon'}]);
});

test('it does not add an id if present', function() {
  db.contacts.insert({id: 5, name: 'Link'});

  deepEqual(db.contacts, [{id: 5, name: 'Link'}]);
});

test('it can insert an array and return it', function() {
  db.contacts.insert({name: 'Link'});
  var contacts = db.contacts.insert([{name: 'Zelda'}, {name: 'Ganon'}]);

  deepEqual(db.contacts, [{id: 1, name: 'Link'}, {id: 2, name: 'Zelda'}, {id: 3, name: 'Ganon'}]);
  deepEqual(contacts, [{id: 2, name: 'Zelda'}, {id: 3, name: 'Ganon'}]);
});

test('it does not add ids to array data if present', function() {
  db.contacts.insert([{id: 2, name: 'Link'}, {id: 1, name: 'Ganon'}]);

  deepEqual(db.contacts, [{id: 2, name: 'Link'}, {id: 1, name: 'Ganon'}]);
});


module('mirage:db#find', {
  setup: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 2, name: 'Link'},
      {id: 'abc', name: 'Ganon'}
    ]);
  },
  teardown: function() {
    db.emptyData();
  }
});

test('returns a record that matches a numerical id', function() {
  var contact = db.contacts.find(2);

  deepEqual(contact, {id: 2, name: 'Link'});
});

test('coerces interger-like ids to integers', function() {
  var contact = db.contacts.find('2');

  deepEqual(contact, {id: 2, name: 'Link'});
});

test('returns a record that matches a string id', function() {
  var contact = db.contacts.find('abc');

  deepEqual(contact, {id: 'abc', name: 'Ganon'});
});


module('mirage:db#where', {
  setup: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {name: 'Link', evil: false},
      {name: 'Zelda', evil: false},
      {name: 'Ganon', evil: true}
    ]);
  },
  teardown: function() {
    db.emptyData();
  }
});

test('returns an array of records that match the query', function() {
  var result = db.contacts.where({evil: true});

  deepEqual(result, [
    {id: 3, name: 'Ganon', evil: true}
  ]);
});

test('returns an empty array if no records match the query', function() {
  var result = db.contacts.where({name: 'Link', evil: true});

  deepEqual(result, []);
});


module('mirage:db#update', {
  setup: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true}
    ]);
  },
  teardown: function() {
    db.emptyData();
  }
});

test('it can update the whole collection', function() {
  db.contacts.update({name: 'Sam', evil: false});

  deepEqual(db.contacts, [
    {id: 1, name: 'Sam', evil: false},
    {id: 2, name: 'Sam', evil: false},
    {id: 3, name: 'Sam', evil: false}
  ]);
});

test('it can update a record by id', function() {
  db.contacts.update(3, {name: 'Ganondorf', evil: false});
  var ganon = db.contacts.find(3);

  deepEqual(ganon, {id: 3, name: 'Ganondorf', evil: false});
});

test('it can update records by query', function() {
  db.contacts.update({evil: false}, {name: 'Sam'});

  deepEqual(db.contacts, [
    {id: 1, name: 'Sam', evil: false},
    {id: 2, name: 'Sam', evil: false},
    {id: 3, name: 'Ganon', evil: true}
  ]);
});


module('mirage:db#remove', {
  setup: function() {
    db = new Db();
    db.createCollection('contacts');
    db.contacts.insert([
      {id: 1, name: 'Link', evil: false},
      {id: 2, name: 'Zelda', evil: false},
      {id: 3, name: 'Ganon', evil: true}
    ]);
  },
  teardown: function() {
    db.emptyData();
  }
});

test('it can remove an entire collection', function() {
  db.contacts.remove();

  deepEqual(db.contacts, []);
});

test('it can remove a single record', function() {
  db.contacts.remove(1);

  deepEqual(db.contacts, [
    {id: 2, name: 'Zelda', evil: false},
    {id: 3, name: 'Ganon', evil: true},
  ]);
});

test('it can remove multiple records by query', function() {
  db.contacts.remove({evil: false});

  deepEqual(db.contacts, [
    {id: 3, name: 'Ganon', evil: true},
  ]);
});
