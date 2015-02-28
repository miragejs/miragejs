import Ember from 'ember';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Store from 'ember-cli-mirage/store';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var store;

module('mirage:frontController DELETE', {
  setup: function() {
    App = startApp();
    store = new Store();
    store.loadData({
      contacts: contacts,
      addresses: addresses
    });
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("string shorthand works", function() {
  var result = controller.handle('delete', 'contact', store, {params: {id: 1}});

  var contactsInStore = store.findAll('contact');
  var Zelda = contacts[1];
  equal(contactsInStore.length, 1);
  deepEqual(contactsInStore[0], Zelda);
});

test("array shorthand works", function() {
  var result = controller.handle('delete', ['contact', 'addresses'], store, {params: {id: 1}});

  var contactsInStore = store.findAll('contact');
  var addressesInStore = store.findAll('addresses');
  var Zelda = contacts[1];
  var ZeldasAddress = addresses[1];
  equal(contactsInStore.length, 1);
  equal(addressesInStore.length, 1);
  deepEqual(contactsInStore[0], Zelda);
  deepEqual(addressesInStore[0], ZeldasAddress);
});

test("undefined shorthand works", function() {
  var result = controller.handle('delete', undefined, store, {params: {id: 1}, url: '/contacts/1'});

  var contactsInStore = store.findAll('contact');
  var Zelda = contacts[1];
  equal(contactsInStore.length, 1);
  deepEqual(contactsInStore[0], Zelda);
});
