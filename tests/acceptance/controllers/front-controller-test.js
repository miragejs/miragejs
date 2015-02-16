import Ember from 'ember';
import startApp from '../../helpers/start-app';
import controller from 'ember-pretenderify/controllers/front';
import store from 'ember-pretenderify/store';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];

module('pretenderify:frontController GET', {
  setup: function() {
    App = startApp();
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

module('pretenderify:frontController POST', {
  setup: function() {
    App = startApp();
    store.loadData({
      contacts: contacts,
      addresses: addresses
    });
  },
  teardown: function() {
    Ember.run(App, 'destroy');
    store.emptyData();
  }
});

test("string shorthand works", function() {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', 'contact', store, {requestBody: body});

  var contactsInStore = store.findAll('contact');
  equal(contactsInStore.length, 3);
  deepEqual(result[2], {contact: {id: 3, name: 'Ganon'}});
});

test("undefined shorthand works", function() {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', undefined, store, {requestBody: body, url: '/contacts'});

  var contactsInStore = store.findAll('contact');
  equal(contactsInStore.length, 3);
  deepEqual(result[2], {contact: {id: 3, name: 'Ganon'}});
});

module('pretenderify:frontController PUT', {
  setup: function() {
    App = startApp();
    store.loadData({
      contacts: contacts,
      addresses: addresses
    });
  },
  teardown: function() {
    Ember.run(App, 'destroy');
    store.emptyData();
  }
});

test("string shorthand works", function() {
  var Link = store.find('contact', 1);
  equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', 'contact', store, {params: {id: 1}, requestBody: body});

  var Link = store.find('contact', 1);
  equal(Link.name, 'Linkz0r');
});

test("undefined shorthand works", function() {
  var Link = store.find('contact', 1);
  equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', undefined, store, {params: {id: 1}, url: '/contacts/1', requestBody: body});

  var Link = store.find('contact', 1);
  equal(Link.name, 'Linkz0r');
});


module('pretenderify:frontController DELETE', {
  setup: function() {
    App = startApp();
    store.loadData({
      contacts: contacts,
      addresses: addresses
    });
  },
  teardown: function() {
    Ember.run(App, 'destroy');
    store.emptyData();
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
