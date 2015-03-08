import Ember from 'ember';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Db from 'ember-cli-mirage/db';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;

module('mirage:frontController DELETE', {
  setup: function() {
    App = startApp();
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("string shorthand works", function() {
  var result = controller.handle('delete', 'contact', db, {params: {id: 1}});

  var contactsInDb = db.contacts;
  var Zelda = contacts[1];
  equal(contactsInDb.length, 1);
  deepEqual(contactsInDb[0], Zelda);
});

test("array shorthand works", function() {
  var result = controller.handle('delete', ['contact', 'addresses'], db, {params: {id: 1}});

  var contactsInDb = db.contacts;
  var addressesInDb = db.addresses;
  var Zelda = contacts[1];
  var ZeldasAddress = addresses[1];
  equal(contactsInDb.length, 1);
  equal(addressesInDb.length, 1);
  deepEqual(contactsInDb[0], Zelda);
  deepEqual(addressesInDb[0], ZeldasAddress);
});

test("undefined shorthand works", function() {
  var result = controller.handle('delete', undefined, db, {params: {id: 1}, url: '/contacts/1'});

  var contactsInDb = db.contacts;
  var Zelda = contacts[1];
  equal(contactsInDb.length, 1);
  deepEqual(contactsInDb[0], Zelda);
});
