import Ember from 'ember';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Store from 'ember-cli-mirage/store';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var store;

module('mirage:frontController GET', {
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

// TODO: AMS-type response dependency, includes key
// TODO: Extract to single class for data, handle response code/app elsewhere
test("string shorthand works", function() {
  var result = controller.handle('get', 'contacts', store);

  deepEqual(result[2], {contacts: contacts});
});

// e.g. this.stub('get', '/contacts/:id', 'contact');
test("string shorthand with id works", function() {
  var result = controller.handle('get', 'contact', store, {params: {id: 1}});

  deepEqual(result[2], {contact: contacts[0]});
});


// e.g. this.stub('get', '/', ['contacts', 'addresses']);
test("array shorthand works", function() {
  var result = controller.handle('get', ['contacts', 'addresses'], store);

  deepEqual(result[2], {contacts: contacts, addresses: addresses});
});

// TODO: relates collection to singular by type_id field
// e.g. this.stub('get', '/', ['contacts', 'addresses']);
test("array shorthand with id works", function() {
  var result = controller.handle('get', ['contact', 'addresses'], store, {params: {id: 1}});
  var addrs = addresses.filter(function(addr) { return addr.contact_id === 1; });

  deepEqual(result[2], {contact: contacts[0], addresses: addrs});
});


// e.g. this.stub('get', '/contacts');
test("undefined shorthand works", function() {
  var result = controller.handle('get', undefined, store, {url: '/contacts'});

  deepEqual(result[2], {contacts: contacts});
});

// e.g. this.stub('get', '/contacts/:id');
test("undefined shorthand with id works", function() {
  var result = controller.handle('get', undefined, store, {url: '/contacts/1', params: {id: 1}});

  deepEqual(result[2], {contact: contacts[0]});
});
