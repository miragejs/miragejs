import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Db from 'ember-cli-mirage/db';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;

module('mirage:frontController DELETE', {
  beforeEach: function() {
    App = startApp();
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
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
