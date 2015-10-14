import {module, test} from 'qunit';
import Db from 'ember-cli-mirage/db';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';
import PutShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/put';

module('Integration | Route Handlers | PUT', {

  beforeEach: function() {
    this.contacts = [
      {id: 1, first_name: 'Link', address_ids: [1]},
      {id: 2, first_name: 'Zelda', address_ids: [2]},
      {id: 3, first_name: 'Epona', address_ids: []}
    ];
    this.addresses = [
      {id: 1, first_name: '123 Hyrule Way', contact_id: 1},
      {id: 2, first_name: '456 Hyrule Way', contact_id: 2}
    ];

    this.db = new Db({
      contacts: this.contacts,
      addresses: this.addresses,
      photos: this.photos
    });
    this.serializer = new ActiveModelSerializer();
  }

});

test("string shorthand works", function(assert) {
  let link = this.db.contacts.find(1);
  assert.equal(link.first_name, 'Link');

  let handler = new PutShorthandRouteHandler(this.db, this.serializer, 'contact');
  let body = {contact: {id: 1, first_name: "Linkz0r"}};
  let request = {params: {id: 1}, requestBody: JSON.stringify(body)};

  handler.handle(request);

  link = this.db.contacts.find(1);
  assert.equal(link.first_name, 'Linkz0r');
});

test("undefined shorthand works", function(assert) {
  let link = this.db.contacts.find(1);
  assert.equal(link.first_name, 'Link');

  let handler = new PutShorthandRouteHandler(this.db, this.serializer, 'contact');
  let body = {contact: {id: 1, first_name: "Linkz0r"}};
  let request = {params: {id: 1}, url: '/contacts/1', requestBody: JSON.stringify(body)};

  handler.handle(request);

  link = this.db.contacts.find(1);
  assert.equal(link.first_name, 'Linkz0r');
});

test("undefined shorthand works when query params present", function(assert) {
  let link = this.db.contacts.find(1);
  assert.equal(link.first_name, 'Link');

  let handler = new PutShorthandRouteHandler(this.db, this.serializer);
  let body = {contact: {id: 1, first_name: "Linkz0r"}};
  let request = {params: {id: 1}, url: '/contacts/1?some=foo', requestBody: JSON.stringify(body)};

  handler.handle(request);

  link = this.db.contacts.find(1);
  assert.equal(link.first_name, 'Linkz0r');
});
