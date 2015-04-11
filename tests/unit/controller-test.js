import Factory from 'ember-cli-mirage/factory';
import controller from 'ember-cli-mirage/controller';
import Db from 'ember-cli-mirage/db';

import {module, test} from 'qunit';

var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;
module('mirage:controller', {
  beforeEach: function() {
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  }
});

test("function handler works", function(assert) {
  var result = controller.handle('get', function(db, request) {
    return db.contacts;
  }, db, {params: {id: 1}});

  assert.deepEqual(result[2], contacts);
});

test('its default response is 204 if the verb is put', function(assert) {
  var response = controller.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 201 if the verb is post', function(assert) {
  var response = controller.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 204 if the verb is delete', function(assert) {
  var response = controller.handle('delete', {});
  assert.equal(response[0], 204);
});


var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;
module('mirage:controller#get', {
  beforeEach: function() {
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  }
});

// TODO: AMS-type response dependency, includes key
// TODO: Extract to single class for data, handle response code/app elsewhere
test("string shorthand works", function(assert) {
  var result = controller.handle('get', 'contacts', db);

  assert.deepEqual(result[2], {contacts: contacts});
});

// e.g. this.stub('get', '/contacts/:id', 'contact');
test("string shorthand with id works", function(assert) {
  var result = controller.handle('get', 'contact', db, {params: {id: 1}});

  assert.deepEqual(result[2], {contact: contacts[0]});
});


// e.g. this.stub('get', '/', ['contacts', 'addresses']);
test("array shorthand works", function(assert) {
  var result = controller.handle('get', ['contacts', 'addresses'], db);

  assert.deepEqual(result[2], {contacts: contacts, addresses: addresses});
});

// TODO: relates collection to singular by type_id field
// e.g. this.stub('get', '/', ['contacts', 'addresses']);
test("array shorthand with id works", function(assert) {
  var result = controller.handle('get', ['contact', 'addresses'], db, {params: {id: 1}});
  var addrs = addresses.filter(function(addr) { return addr.contact_id === 1; });

  assert.deepEqual(result[2], {contact: contacts[0], addresses: addrs});
});


// e.g. this.stub('get', '/contacts');
test("undefined shorthand works", function(assert) {
  var result = controller.handle('get', undefined, db, {url: '/api/v1/contacts'});

  assert.deepEqual(result[2], {contacts: contacts});
});

test("undefined shorthand works when query params are present", function(assert) {
  var result = controller.handle('get', undefined, db, {url: '/contacts?foo=true'});

  assert.deepEqual(result[2], {contacts: contacts});
});

// e.g. this.stub('get', '/contacts/:id');
test("undefined shorthand with id works", function(assert) {
  var result = controller.handle('get', undefined, db, {url: '/contacts/1', params: {id: 1}});

  assert.deepEqual(result[2], {contact: contacts[0]});
});

// e.g. this.stub('get', '/contacts/:id');
test("undefined shorthand with id works when query params are present", function(assert) {
  var result = controller.handle('get', undefined, db, {url: '/contacts/1?foo=true', params: {id: 1}});

  assert.deepEqual(result[2], {contact: contacts[0]});
});


var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;
module('mirage:controller#put', {
  beforeEach: function() {
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  }
});

test("string shorthand works", function(assert) {
  var Link = db.contacts.find(1);
  assert.equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', 'contact', db, {params: {id: 1}, requestBody: body});

  Link = db.contacts.find(1);
  assert.equal(Link.name, 'Linkz0r');
});

test("undefined shorthand works", function(assert) {
  var Link = db.contacts.find(1);
  assert.equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', undefined, db, {params: {id: 1}, url: '/contacts/1', requestBody: body});

  Link = db.contacts.find(1);
  assert.equal(Link.name, 'Linkz0r');
});

test("undefined shorthand works when query params present", function(assert) {
  var Link = db.contacts.find(1);
  assert.equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', undefined, db, {params: {id: 1}, url: '/contacts/1?some=foo', requestBody: body});

  Link = db.contacts.find(1);
  assert.equal(Link.name, 'Linkz0r');
});

module('mirage:controller#post', {
  beforeEach: function() {
    db = new Db();
    db.createCollection('contacts');
  }
});

test("string shorthand works", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', 'contact', db, {requestBody: body});

  var contactsInDb = db.contacts;
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', undefined, db, {requestBody: body, url: '/contacts'});

  var contactsInDb = db.contacts;
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works when query params present", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', undefined, db, {requestBody: body, url: '/contacts?foo=bar'});

  var contactsInDb = db.contacts;
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});


var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;
module('mirage:controller#delete', {
  beforeEach: function() {
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  }
});

test("string shorthand works", function(assert) {
  var result = controller.handle('delete', 'contact', db, {params: {id: 1}});

  var contactsInDb = db.contacts;
  var Zelda = contacts[1];
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
});

test("array shorthand works", function(assert) {
  var result = controller.handle('delete', ['contact', 'addresses'], db, {params: {id: 1}});

  var contactsInDb = db.contacts;
  var addressesInDb = db.addresses;
  var Zelda = contacts[1];
  var ZeldasAddress = addresses[1];
  assert.equal(contactsInDb.length, 1);
  assert.equal(addressesInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
  assert.deepEqual(addressesInDb[0], ZeldasAddress);
});

test("undefined shorthand works", function(assert) {
  var result = controller.handle('delete', undefined, db, {params: {id: 1}, url: '/contacts/1'});

  var contactsInDb = db.contacts;
  var Zelda = contacts[1];
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
});
