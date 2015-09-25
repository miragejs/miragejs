import {module, test} from 'qunit';
import GetShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/get';
import Db from 'ember-cli-mirage/db';
import Response from 'ember-cli-mirage/response';

module('Integration | Route Handlers | GET', {

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
  let handler = new GetShorthandRouteHandler(this.db);
  let request = {url: '/api/v1/contacts'};

  let result = handler.handle(request);

  assert.deepEqual(result, {contacts: this.contacts});
});

test('undefined shorthand ignores query params', function(assert) {
  let handler = new GetShorthandRouteHandler(this.db);
  let request = {url: '/api/v1/contacts?foo=bar', queryParams: {foo: 'bar'}};

  let result = handler.handle(request);

  assert.deepEqual(result, {contacts: this.contacts});
});

test('undefined shorthand can coalesce ids', function(assert) {
  let options = {coalesce: true};
  let handler = new GetShorthandRouteHandler(this.db, undefined, options);
  let request = {url: '/contacts', queryParams: {ids: [1, 3]}};

  let result = handler.handle(request);

  assert.deepEqual(result, {contacts: this.contacts.filter(contact => [1, 3].indexOf(contact.id) > -1)});
});

test('undefined shorthand can return a singular resource', function(assert) {
  let handler = new GetShorthandRouteHandler(this.db, undefined);
  let request = {url: '/addresses/1', params: {id: '1'}};

  let result = handler.handle(request);

  assert.deepEqual(result, {address: this.addresses[0]});
});

test('undefined shorthand ignores query params on a singular resource', function(assert) {
  let request = {url: '/addresses/1?foo=bar', params: {id: '1'}, queryParams: {foo: 'bar'}};
  let handler = new GetShorthandRouteHandler(this.db, undefined);

  let result = handler.handle(request);

  assert.deepEqual(result, {address: this.addresses[0]});
});

test('undefined shorthand returns an 404 if a singular resource does not exist', function(assert) {
  let request = {url: '/addresses/99', params: {id: '99'}};
  let handler = new GetShorthandRouteHandler(this.db, undefined);

  let result = handler.handle(request);

  assert.ok(result instanceof Response);
  assert.equal(result.toRackResponse()[0], 404);
});

test('string shorthand returns the named collection', function(assert) {
  let request = {url: '/people'};
  let handler = new GetShorthandRouteHandler(this.db, 'contacts');

  let result = handler.handle(request);

  assert.deepEqual(result, {contacts: this.contacts});
});

test('string shorthand can coalesce ids', function(assert) {
  let request = {url: '/people', queryParams: {ids: [1, 3]}};
  let options = {coalesce: true};
  let handler = new GetShorthandRouteHandler(this.db, 'contacts', options);

  let result = handler.handle(request);

  assert.deepEqual(result, {contacts: this.contacts.filter(contact => [1, 3].indexOf(contact.id) > -1)});
});

test('string shorthand with an id returns the named record', function(assert) {
  let request = {url: '/people/1', params: {id: 1}};
  let handler = new GetShorthandRouteHandler(this.db, 'contact');

  let result = handler.handle(request);

  assert.deepEqual(result, {contact: this.contacts[0]});
});

test('string shorthand with an id returns 404 if the record is not found', function(assert) {
  let request = {url: '/people/9', params: {id: 9}};
  let handler = new GetShorthandRouteHandler(this.db, 'contact');

  let result = handler.handle(request);

  assert.ok(result instanceof Response);
  assert.equal(result.toRackResponse()[0], 404);
});

test('array shorthand returns all collections of each type', function(assert) {
  let request = {url: '/home'};
  let handler = new GetShorthandRouteHandler(this.db, ['contacts', 'photos']);

  let result = handler.handle(request);

  assert.deepEqual(result, {
    contacts: this.contacts,
    photos: this.photos
  });
});

test('array shorthand for a singular resource returns all related resources of each type', function(assert) {
  let request = {url: '/contacts/1', params: {id: 1}};
  let handler = new GetShorthandRouteHandler(this.db, ['contact', 'addresses']);

  let result = handler.handle(request);

  let addrs = this.addresses.filter(addr => addr.contact_id === 1);
  assert.deepEqual(result, {
    contact: this.contacts[0],
    addresses: addrs
  });
});
