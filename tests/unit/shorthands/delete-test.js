import del from 'ember-cli-mirage/shorthands/delete';
import Db from 'ember-cli-mirage/orm/db';

import {module, test} from 'qunit';

var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;
module('mirage:shorthands#delete', {
  beforeEach: function() {
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  }
});

test("string shorthand works", function(assert) {
  del.string('contact', db, {params: {id: 1}});

  var contactsInDb = db.contacts.all();
  var Zelda = contacts[1];
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
});

test("array shorthand works", function(assert) {
  del.array(['contact', 'addresses'], db, {params: {id: 1}});

  var contactsInDb = db.contacts.all();
  var addressesInDb = db.addresses.all();
  var Zelda = contacts[1];
  var ZeldasAddress = addresses[1];
  assert.equal(contactsInDb.length, 1);
  assert.equal(addressesInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
  assert.deepEqual(addressesInDb[0], ZeldasAddress);
});

test("undefined shorthand works", function(assert) {
  del.undefined(undefined, db, {params: {id: 1}, url: '/contacts/1'});

  var contactsInDb = db.contacts.all();
  var Zelda = contacts[1];
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], Zelda);
});
