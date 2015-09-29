import {module, test} from 'qunit';
import DeleteShorthandRouteHandler from 'ember-cli-mirage/route-handlers/shorthands/delete';
import Db from 'ember-cli-mirage/db';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';

module('Integration | Route Handlers | DELETE', {

  beforeEach: function() {
    this.contacts = [
      {id: 1, name: 'Link', address_ids: [1]},
      {id: 2, name: 'Zelda', address_ids: [2]}
    ];
    this.addresses = [
      {id: 1, name: '123 Hyrule Way', contact_id: 1},
      {id: 2, name: '456 Hyrule Way', contact_id: 2}
    ];

    this.db = new Db({
      contacts: this.contacts,
      addresses: this.addresses
    });
    this.serializer = new ActiveModelSerializer();
  }

});

test("string shorthand works", function(assert) {
  let handler = new DeleteShorthandRouteHandler(this.db, this.serializer, 'contact');
  let request = {params: {id: 1}};

  handler.handle(request);

  let contactsInDb = this.db.contacts;
  let Zelda = this.contacts[1];
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
});

test("array shorthand works", function(assert) {
  let handler = new DeleteShorthandRouteHandler(this.db, this.serializer, ['contact', 'addresses']);
  let request = {params: {id: 1}};

  handler.handle(request);

  let contactsInDb = this.db.contacts;
  let addressesInDb = this.db.addresses;
  let Zelda = this.contacts[1];
  let ZeldasAddress = this.addresses[1];

  assert.equal(contactsInDb.length, 1);
  assert.equal(addressesInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
  assert.deepEqual(addressesInDb[0], ZeldasAddress);
});

test("undefined shorthand works", function(assert) {
  let handler = new DeleteShorthandRouteHandler(this.db, this.serializer);
  let request = {params: {id: 1}, url: '/contacts/1'};

  handler.handle(request);

  var contactsInDb = this.db.contacts;
  var Zelda = this.contacts[1];
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
});
