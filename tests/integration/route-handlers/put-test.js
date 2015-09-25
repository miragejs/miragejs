import {module, test} from 'qunit';
import PutShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/put';
import Db from 'ember-cli-mirage/db';

module('Integration | Route Handlers | PUT', {

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

    this.db = new Db({
      contacts: this.contacts,
      addresses: this.addresses,
      photos: this.photos
    });
  }

});

test("string shorthand works", function(assert) {
  let link = this.db.contacts.find(1);
  assert.equal(link.name, 'Link');

  let handler = new PutShorthandRouteHandler(this.db, 'contact');
  let body = {contact: {id: 1, name: "Linkz0r"}};
  let request = {params: {id: 1}, requestBody: JSON.stringify(body)};

  handler.handle(request);

  link = this.db.contacts.find(1);
  assert.equal(link.name, 'Linkz0r');
});

test("undefined shorthand works", function(assert) {
  let link = this.db.contacts.find(1);
  assert.equal(link.name, 'Link');

  let handler = new PutShorthandRouteHandler(this.db, 'contact');
  let body = {contact: {id: 1, name: "Linkz0r"}};
  let request = {params: {id: 1}, url: '/contacts/1', requestBody: JSON.stringify(body)};

  handler.handle(request);

  link = this.db.contacts.find(1);
  assert.equal(link.name, 'Linkz0r');
});

test("undefined shorthand works when query params present", function(assert) {
  let link = this.db.contacts.find(1);
  assert.equal(link.name, 'Link');

  let handler = new PutShorthandRouteHandler(this.db);
  let body = {contact: {id: 1, name: "Linkz0r"}};
  let request = {params: {id: 1}, url: '/contacts/1?some=foo', requestBody: JSON.stringify(body)};

  handler.handle(request);

  link = this.db.contacts.find(1);
  assert.equal(link.name, 'Linkz0r');
});
