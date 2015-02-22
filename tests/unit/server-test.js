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


module('pretenderify:server#create');

test('create fails when no factories are regisered', function() {
  var server = new Server({environment: 'test'});

  throws(function() {
    var contact = server.create('contact');
  });
});

test('create fails when an expected factory isn\'t registered', function() {
  var server = new Server({environment: 'test'});
  server.loadFactories({
    address: Factory.define()
  });

  throws(function() {
    var contact = server.create('contact');
  });
});

test('create works', function() {
  var server = new Server({environment: 'test'});
  server.loadFactories({
    contact: Factory.define({name: 'Sam'})
  });

  var contact = server.create('contact');

  equal(contact.name, 'Sam');
  //equal(contact.id, server.store.findAll('contact'));
});
