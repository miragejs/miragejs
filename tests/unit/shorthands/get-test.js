import get from 'ember-cli-mirage/shorthands/get';
import Response from 'ember-cli-mirage/response';
import Db from 'ember-cli-mirage/db';

import {module, test} from 'qunit';

module('mirage:shorthands#get', {
  beforeEach: function() {
    this.contacts = [
      {id: 1, name: 'Link', address_ids: [1]},
      {id: 2, name: 'Zelda', address_ids: [2]},
      {id: 3, name: 'Epona', address_ids: []}
    ];
    this.addresses = [
      {id: 1, name: '123 Hyrule Way', contact_id: 1},
      {id: 2, name: '456 Hyrule Way', contact_id: 2}
    ];
    this.photos = [
      {id: 1, title: 'Awesome'},
      {id: 2, title: 'Photo'}
    ];

    this.db = new Db({
      contacts: this.contacts,
      addresses: this.addresses,
      photos: this.photos
    });
  }
});

test('undefined shorthand returns the correct collection', function(assert) {
  var result = get.undefined(undefined, this.db, {url: '/api/v1/contacts'});

  assert.deepEqual(result, {contacts: this.contacts});
});

test('undefined shorthand ignores query params', function(assert) {
  var result = get.undefined(undefined, this.db, {url: '/api/v1/contacts?foo=bar', queryParams: {foo: 'bar'}});

  assert.deepEqual(result, {contacts: this.contacts});
});

test('undefined shorthand can coalesce ids', function(assert) {
  var result = get.undefined(undefined, this.db, {url: '/contacts', queryParams: {ids: [1, 3]}}, {coalesce: true});

  assert.deepEqual(result, {contacts: this.contacts.filter(contact => [1, 3].indexOf(contact.id) > -1)});
});

test('undefined shorthand can return a singular resource', function(assert) {
  var result = get.undefined(undefined, this.db, {url: '/addresses/1', params: {id: '1'}});

  assert.deepEqual(result, {address: this.addresses[0]});
});

test('undefined shorthand ignores query params on a singular resource', function(assert) {
  var result = get.undefined(undefined, this.db, {url: '/addresses/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}});

  assert.deepEqual(result, {address: this.addresses[0]});
});

test('undefined shorthand returns an 404 if a singular resource does not exist', function(assert) {
  var result = get.undefined(undefined, this.db, {url: '/addresses/99', params: {id: '99'}});

  assert.ok(result instanceof Response);
  assert.equal(result.toArray()[0], 404);
});

test('string shorthand returns the named collection', function(assert) {
  var result = get.string('contacts', this.db, {url: '/people'});

  assert.deepEqual(result, {contacts: this.contacts});
});

test('string shorthand can coalesce ids', function(assert) {
  var result = get.string('contacts', this.db, {url: '/people', queryParams: {ids: [1, 3]}}, {coalesce: true});

  assert.deepEqual(result, {contacts: this.contacts.filter(contact => [1, 3].indexOf(contact.id) > -1)});
});

test('string shorthand with an id returns the named record', function(assert) {
  var result = get.string('contact', this.db, {url: '/people/1', params: {id: 1}});

  assert.deepEqual(result, {contact: this.contacts[0]});
});

test('string shorthand with an id returns 404 if the record is not found', function(assert) {
  var result = get.string('contact', this.db, {url: '/people/9', params: {id: 9}});

  assert.ok(result instanceof Response);
  assert.equal(result.toArray()[0], 404);
});

test('array shorthand returns all collections of each type', function(assert) {
  var result = get.array(['contacts', 'photos'], this.db, {url: '/home'});

  assert.deepEqual(result, {
    contacts: this.contacts,
    photos: this.photos
  });
});

test('array shorthand for a singular resource returns all related resources of each type', function(assert) {
  var result = get.array(['contact', 'addresses'], this.db, {url: '/contacts/1', params: {id: 1}});
  var addrs = this.addresses.filter(addr => addr.contact_id === 1);

  assert.deepEqual(result, {
    contact: this.contacts[0],
    addresses: addrs
  });
});
