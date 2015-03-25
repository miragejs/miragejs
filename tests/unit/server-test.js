/* global server: true */
import Server from 'ember-cli-mirage/server';
import {module, test} from 'qunit';
import Factory from 'ember-cli-mirage/factory';

module('mirage:server');

test('it can be instantiated', function(assert) {
  var server = new Server({environment: 'test'});
  assert.ok(server);
});

test('it cannot be instantiated without an environment', function(assert) {
  assert.throws(function() {
    var server = new Server();
  });
});

module('mirage:server#loadConfig');

test('forces timing to 0 in test environment', function(assert) {
  var server = new Server({environment: 'test'});
  server.loadConfig(function() {
    this.timing = 50;
  });
  assert.equal(server.timing, 0);
});

test("doesn't modify user's timing config in other environments", function(assert) {
  var server = new Server({environment: 'blah'});
  server.loadConfig(function() {
    this.timing = 50;
  });
  assert.equal(server.timing, 50);
});

module('mirage:server#db');

test('its db is isolated across instances', function(assert) {
  var server1 = new Server({environment: 'test'});
  server1.db.createCollection('contacts');
  server1.db.contacts.insert({name: 'Sam'});

  var server2 = new Server({environment: 'test'});

  assert.equal(server2.contacts, undefined);
});


var server;
module('mirage:server#create', {
  beforeEach: function() {
    server = new Server({environment: 'test'});
  }
});

test('create fails when no factories are regisered', function(assert) {
  assert.throws(function() {
    var contact = server.create('contact');
  });
});

test('create fails when an expected factory isn\'t registered', function(assert) {
  server.loadFactories({
    address: Factory.extend()
  });

  assert.throws(function() {
    var contact = server.create('contact');
  });
});

test('create adds the data to the db', function(assert) {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  server.create('contact');
  var contactsInDb = server.db.contacts.all();

  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], {id: 1, name: 'Sam'});
});

test('create returns the new data in the db', function(assert) {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var contact = server.create('contact');

  assert.deepEqual(contact, {id: 1, name: 'Sam'});
});

test('create allows for attr overrides', function(assert) {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var sam = server.create('contact');
  var link = server.create('contact', {name: 'Link'});

  assert.deepEqual(sam, {id: 1, name: 'Sam'});
  assert.deepEqual(link, {id: 2, name: 'Link'});
});

test('create allows for attr overrides with extended factories', function(assert) {
  var ContactFactory = Factory.extend({
    name: 'Link',
    age: 500
  });
  var FriendFactory = ContactFactory.extend({
    is_young: function() {
      return this.age < 18;
    }
  });
  server.loadFactories({
    contact: ContactFactory,
    friend: FriendFactory
  });

  var link = server.create('friend');
  var youngLink = server.create('friend', {age: 10});

  assert.deepEqual(link, {id: 1, name: 'Link', age: 500, is_young: false});
  assert.deepEqual(youngLink, {id: 2, name: 'Link', age: 10, is_young: true});
});

test('create allows for attr overrides with arrays', function(assert) {
  server.loadFactories({
    contact: Factory.extend({name: ['Sam', 'Carl']})
  });

  var sam = server.create('contact');
  var link = server.create('contact', {name: ['Link']});
  var noname = server.create('contact', {name: []});

  assert.deepEqual(sam, {id: 1, name: ['Sam', 'Carl']});
  assert.deepEqual(link, {id: 2, name: ['Link']});
  assert.deepEqual(noname, {id: 3, name: []});
});

module('mirage:server#createList', {
  beforeEach: function() {
    server = new Server({environment: 'test'});
  }
});

test('createList adds the given number of elements to the db', function(assert) {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  server.createList('contact', 3);
  var contactsInDb = server.db.contacts.all();

  assert.equal(contactsInDb.length, 3);
  assert.deepEqual(contactsInDb[0], {id: 1, name: 'Sam'});
  assert.deepEqual(contactsInDb[1], {id: 2, name: 'Sam'});
  assert.deepEqual(contactsInDb[2], {id: 3, name: 'Sam'});
});

test('createList returns the created elements', function(assert) {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  server.create('contact');
  var contacts = server.createList('contact', 3);

  assert.equal(contacts.length, 3);
  assert.deepEqual(contacts[0], {id: 2, name: 'Sam'});
  assert.deepEqual(contacts[1], {id: 3, name: 'Sam'});
  assert.deepEqual(contacts[2], {id: 4, name: 'Sam'});
});

test('createList respects sequences', function(assert) {
  server.loadFactories({
    contact: Factory.extend({
      name: function(i) {
        return 'name' + i;
      }
    })
  });

  var contacts = server.createList('contact', 3);

  assert.deepEqual(contacts[0], {id: 1, name: 'name0'});
  assert.deepEqual(contacts[1], {id: 2, name: 'name1'});
  assert.deepEqual(contacts[2], {id: 3, name: 'name2'});
});

test('createList respects attr overrides', function(assert) {
  server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var sams = server.createList('contact', 2);
  var links = server.createList('contact', 2, {name: 'Link'});

  assert.deepEqual(sams[0], {id: 1, name: 'Sam'});
  assert.deepEqual(sams[1], {id: 2, name: 'Sam'});
  assert.deepEqual(links[0], {id: 3, name: 'Link'});
  assert.deepEqual(links[1], {id: 4, name: 'Link'});
});
