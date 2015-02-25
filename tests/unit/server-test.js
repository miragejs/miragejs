/* global server: true */
import Server from 'ember-pretenderify/server';
import Factory from 'ember-pretenderify/factory';

module('pretenderify:server');

test('it can be instantiated', function() {
  var server = new Server({environment: 'test'});
  ok(server);
});

test('it cannot be instantiated without an environment', function() {
  throws(function() {
    var server = new Server();
  });
});

module('pretenderify:server#store');

test('its store is isolated across instances', function() {
  var server1 = new Server({environment: 'test'});
  server1.store.loadData({
    contacts: [{id: 1, name: 'Sam'}]
  });
  var server2 = new Server({environment: 'test'});

  equal(server2.store.findAll('contact'), undefined);
});


var server;
module('pretenderify:server#create', {
  setup: function() {
    server = new Server({environment: 'test'});
  }
});

test('create fails when no factories are regisered', function() {
  throws(function() {
    var contact = server.create('contact');
  });
});

test('create fails when an expected factory isn\'t registered', function() {
  server.loadFactories({
    address: Factory.extend()
  });

  throws(function() {
    var contact = server.create('contact');
  });
});

test('create adds the data to the store', function() {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  server.create('contact');
  var contactsInStore = server.store.findAll('contact');

  equal(contactsInStore.length, 1);
  deepEqual(contactsInStore[0], {id: 1, name: 'Sam'});
});

test('create returns the new data in the store', function() {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var contact = server.create('contact');

  deepEqual(contact, {id: 1, name: 'Sam'});
});

test('create allows for attr overrides', function() {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var sam = server.create('contact');
  var link = server.create('contact', {name: 'Link'});

  deepEqual(sam, {id: 1, name: 'Sam'});
  deepEqual(link, {id: 2, name: 'Link'});
});
