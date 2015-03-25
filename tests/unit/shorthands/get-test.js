import get from 'ember-cli-mirage/shorthands/get';
import Db from 'ember-cli-mirage/orm/db';

import {module, test} from 'qunit';

var contacts = [
  {id: 1, name: 'Link', address_ids: [1]},
  {id: 2, name: 'Zelda', address_ids: [2]},
  {id: 3, name: 'Epona', address_ids: []}
];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;
module('mirage:shorthands#get', {
  beforeEach: function() {
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  }
});

// TODO: AMS-type response dependency, includes key
test("string shorthand works", function(assert) {
  var result = get.string('contacts', db);

  assert.deepEqual(result, {contacts: contacts});
});

// e.g. this.stub('get', '/contacts/:id', 'contact');
test("string shorthand with id works", function(assert) {
  var result = get.string('contact', db, {params: {id: 1}});

  assert.deepEqual(result, {contact: contacts[0]});

  var result404 = get.undefined(undefined, db, {url: '/contacts/1', params: {id: 999}});
  assert.equal(result404.toArray()[0], 404, 'Status is Not Found');
});

// e.g. this.stub('get', '/contacts?ids=1,3', 'contact');
test("string shorthand works with coalesce options", function(assert) {
  var reqWithManyIds = { queryParams: { ids: [1, 3] } };
  var result = get.string('contacts', db, reqWithManyIds, { coalesce: true });

  assert.deepEqual(result, { contacts: [ contacts[0], contacts[2] ]});
});

// e.g. this.stub('get', '/', ['contacts', 'addresses']);
test("array shorthand works", function(assert) {
  var result = get.array(['contacts', 'addresses'], db);

  assert.deepEqual(result, {contacts: contacts, addresses: addresses});
});

// TODO: relates collection to singular by type_id field
// e.g. this.stub('get', '/', ['contacts', 'addresses']);
test("array shorthand with id works", function(assert) {
  var result = get.array(['contact', 'addresses'], db, {params: {id: 1}});
  var addrs = addresses.filter(function(addr) { return addr.contact_id === 1; });

  assert.deepEqual(result, {contact: contacts[0], addresses: addrs});
});

// e.g. this.stub('get', '/contacts');
test("undefined shorthand works", function(assert) {
  var result = get.undefined(undefined, db, {url: '/api/v1/contacts'});

  assert.deepEqual(result, {contacts: contacts});
});

test("undefined shorthand works when query params are present", function(assert) {
  var result = get.undefined(undefined, db, {url: '/contacts?foo=true'});

  assert.deepEqual(result, {contacts: contacts});
});

// e.g. this.stub('get', '/contacts/:id');
test("undefined shorthand with id works", function(assert) {
  var result = get.undefined(undefined, db, {url: '/contacts/1', params: {id: 1}});

  assert.deepEqual(result, {contact: contacts[0]});

  var result404 = get.undefined(undefined, db, {url: '/contacts/1', params: {id: 999}});
  assert.equal(result404.toArray()[0], 404, 'Status is Not Found');
});

// e.g. this.stub('get', '/contacts/:id');
test("undefined shorthand with id works when query params are present", function(assert) {
  var result = get.undefined(undefined, db, {url: '/contacts/1?foo=true', params: {id: 1}});

  assert.deepEqual(result, {contact: contacts[0]});
});

// e.g. this.stub('get', '/contacts/:id');
test("undefined shorthand with ids in the query params and coalesced enabled works", function(assert) {
  var request = { url: '/contacts?ids=1,2,3', queryParams: { ids: [1,3] } };
  var result = get.undefined(undefined, db, request, { coalesce: true });

  assert.deepEqual(result, { contacts: [ contacts[0], contacts[2] ]});
});
