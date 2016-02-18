import Server, { defaultPassthroughs } from 'ember-cli-mirage/server';
import {module, test} from 'qunit';
import Factory from 'ember-cli-mirage/factory';

module('Unit | Server');

test('it can be instantiated', function(assert) {
  var server = new Server({environment: 'test'});
  assert.ok(server);
});

module('Unit | Server #loadConfig');

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

module('Unit | Server #db');

test('its db is isolated across instances', function(assert) {
  var server1 = new Server({environment: 'test'});
  server1.db.createCollection('contacts');
  server1.db.contacts.insert({name: 'Sam'});

  var server2 = new Server({environment: 'test'});

  assert.equal(server2.contacts, undefined);
});


module('Unit | Server #create', {
  beforeEach: function() {
    this.server = new Server({environment: 'test'});
  }
});

test('create fails when no factories are regisered', function(assert) {
  assert.throws(function() {
    this.server.create('contact');
  });
});

test('create fails when an expected factory isn\'t registered', function(assert) {
  this.server.loadFactories({
    address: Factory.extend()
  });

  assert.throws(function() {
    this.server.create('contact');
  });
});

test('create adds the data to the db', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  this.server.create('contact');
  var contactsInDb = this.server.db.contacts;

  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(contactsInDb[0], {id: '1', name: 'Sam'});
});

test('create returns the new data in the db', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var contact = this.server.create('contact');

  assert.deepEqual(contact, {id: '1', name: 'Sam'});
});

test('create allows for attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var sam = this.server.create('contact');
  var link = this.server.create('contact', {name: 'Link'});

  assert.deepEqual(sam, {id: '1', name: 'Sam'});
  assert.deepEqual(link, {id: '2', name: 'Link'});
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
  this.server.loadFactories({
    contact: ContactFactory,
    friend: FriendFactory
  });

  var link = this.server.create('friend');
  var youngLink = this.server.create('friend', {age: 10});

  assert.deepEqual(link, {id: '1', name: 'Link', age: 500, is_young: false});
  assert.deepEqual(youngLink, {id: '2', name: 'Link', age: 10, is_young: true});
});

test('create allows for attr overrides with arrays', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: ['Sam', 'Carl']})
  });

  var sam = this.server.create('contact');
  var link = this.server.create('contact', {name: ['Link']});
  var noname = this.server.create('contact', {name: []});

  assert.deepEqual(sam, {id: '1', name: ['Sam', 'Carl']});
  assert.deepEqual(link, {id: '2', name: ['Link']});
  assert.deepEqual(noname, {id: '3', name: []});
});

test('create allows for nested attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({
      address: {
        streetName: 'Main',
        streetAddress(i) {
          return 1000 + i;
        }
      }
    })
  });

  var contact1 = this.server.create('contact');
  var contact2 = this.server.create('contact');

  assert.deepEqual(contact1, {id: '1', address: {streetName: 'Main', streetAddress: 1000}});
  assert.deepEqual(contact2, {id: '2', address: {streetName: 'Main', streetAddress: 1001}});
});

test('create allows for arrays of attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({
      websites: [
        'http://example.com',
        function(i) {
          return `http://placekitten.com/${320 + i}/${240 + i}`;
        }
      ]
    })
  });

  var contact1 = this.server.create('contact');
  var contact2 = this.server.create('contact');

  assert.deepEqual(contact1, {id: '1', websites: ['http://example.com', 'http://placekitten.com/320/240']});
  assert.deepEqual(contact2, {id: '2', websites: ['http://example.com', 'http://placekitten.com/321/241']});
});

module('Unit | Server #createList', {
  beforeEach: function() {
    this.server = new Server({environment: 'test'});
  }
});

test('createList adds the given number of elements to the db', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  this.server.createList('contact', 3);
  var contactsInDb = this.server.db.contacts;

  assert.equal(contactsInDb.length, 3);
  assert.deepEqual(contactsInDb[0], {id: '1', name: 'Sam'});
  assert.deepEqual(contactsInDb[1], {id: '2', name: 'Sam'});
  assert.deepEqual(contactsInDb[2], {id: '3', name: 'Sam'});
});

test('createList returns the created elements', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  this.server.create('contact');
  var contacts = this.server.createList('contact', 3);

  assert.equal(contacts.length, 3);
  assert.deepEqual(contacts[0], {id: '2', name: 'Sam'});
  assert.deepEqual(contacts[1], {id: '3', name: 'Sam'});
  assert.deepEqual(contacts[2], {id: '4', name: 'Sam'});
});

test('createList respects sequences', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({
      name: function(i) {
        return 'name' + i;
      }
    })
  });

  var contacts = this.server.createList('contact', 3);

  assert.deepEqual(contacts[0], {id: '1', name: 'name0'});
  assert.deepEqual(contacts[1], {id: '2', name: 'name1'});
  assert.deepEqual(contacts[2], {id: '3', name: 'name2'});
});

test('createList respects attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var sams = this.server.createList('contact', 2);
  var links = this.server.createList('contact', 2, {name: 'Link'});

  assert.deepEqual(sams[0], {id: '1', name: 'Sam'});
  assert.deepEqual(sams[1], {id: '2', name: 'Sam'});
  assert.deepEqual(links[0], {id: '3', name: 'Link'});
  assert.deepEqual(links[1], {id: '4', name: 'Link'});
});

module('Unit | Server #build', {
  beforeEach: function() {
    this.server = new Server({environment: 'test'});
  }
});

test('build fails when no factories are regisered', function(assert) {
  assert.throws(function() {
    this.server.build('contact');
  });
});

test('build fails when an expected factory isn\'t registered', function(assert) {
  this.server.loadFactories({
    address: Factory.extend()
  });

  assert.throws(function() {
    this.server.build('contact');
  });
});

test('build does not add the data to the db', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  this.server.build('contact');
  var contactsInDb = this.server.db.contacts;

  assert.equal(contactsInDb.length, 0);
});

test('build returns the new attrs with no id', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var contact = this.server.build('contact');

  assert.deepEqual(contact, {name: 'Sam'});
});

test('build allows for attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var sam = this.server.build('contact');
  var link = this.server.build('contact', {name: 'Link'});

  assert.deepEqual(sam, {name: 'Sam'});
  assert.deepEqual(link, {name: 'Link'});
});

test('build allows for attr overrides with extended factories', function(assert) {
  var ContactFactory = Factory.extend({
    name: 'Link',
    age: 500
  });
  var FriendFactory = ContactFactory.extend({
    is_young: function() {
      return this.age < 18;
    }
  });
  this.server.loadFactories({
    contact: ContactFactory,
    friend: FriendFactory
  });

  var link = this.server.build('friend');
  var youngLink = this.server.build('friend', {age: 10});

  assert.deepEqual(link, {name: 'Link', age: 500, is_young: false});
  assert.deepEqual(youngLink, {name: 'Link', age: 10, is_young: true});
});

test('build allows for attr overrides with arrays', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: ['Sam', 'Carl']})
  });

  var sam = this.server.build('contact');
  var link = this.server.build('contact', {name: ['Link']});
  var noname = this.server.build('contact', {name: []});

  assert.deepEqual(sam, {name: ['Sam', 'Carl']});
  assert.deepEqual(link, {name: ['Link']});
  assert.deepEqual(noname, {name: []});
});

test('build allows for nested attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({
      address: {
        streetName: 'Main',
        streetAddress(i) {
          return 1000 + i;
        }
      }
    })
  });

  var contact1 = this.server.build('contact');
  var contact2 = this.server.build('contact');

  assert.deepEqual(contact1, {address: {streetName: 'Main', streetAddress: 1000}});
  assert.deepEqual(contact2, {address: {streetName: 'Main', streetAddress: 1001}});
});

test('build allows for arrays of attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({
      websites: [
        'http://example.com',
        function(i) {
          return `http://placekitten.com/${320 + i}/${240 + i}`;
        }
      ]
    })
  });

  var contact1 = this.server.build('contact');
  var contact2 = this.server.build('contact');

  assert.deepEqual(contact1, {websites: ['http://example.com', 'http://placekitten.com/320/240']});
  assert.deepEqual(contact2, {websites: ['http://example.com', 'http://placekitten.com/321/241']});
});

module('Unit | Server #buildList', {
  beforeEach: function() {
    this.server = new Server({environment: 'test'});
  }
});

test('buildList does not add elements to the db', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  this.server.buildList('contact', 3);
  var contactsInDb = this.server.db.contacts;

  assert.equal(contactsInDb.length, 0);
});

test('buildList returns the built elements without ids', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  this.server.create('contact');
  var contacts = this.server.buildList('contact', 3);

  assert.equal(contacts.length, 3);
  assert.deepEqual(contacts[0], {name: 'Sam'});
  assert.deepEqual(contacts[1], {name: 'Sam'});
  assert.deepEqual(contacts[2], {name: 'Sam'});
});

test('buildList respects sequences', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({
      name: function(i) {
        return 'name' + i;
      }
    })
  });

  var contacts = this.server.buildList('contact', 3);

  assert.deepEqual(contacts[0], {name: 'name0'});
  assert.deepEqual(contacts[1], {name: 'name1'});
  assert.deepEqual(contacts[2], {name: 'name2'});
});

test('buildList respects attr overrides', function(assert) {
  this.server.loadFactories({
    contact: Factory.extend({name: 'Sam'})
  });

  var sams = this.server.buildList('contact', 2);
  var links = this.server.buildList('contact', 2, {name: 'Link'});

  assert.deepEqual(sams[0], {name: 'Sam'});
  assert.deepEqual(sams[1], {name: 'Sam'});
  assert.deepEqual(links[0], {name: 'Link'});
  assert.deepEqual(links[1], {name: 'Link'});
});


module('Unit | Server #defaultPassthroughs');

test('server configures default passthroughs when useDefaultPassthroughs is true', function(assert) {
  var server = new Server({ useDefaultPassthroughs: true });

  assert.expect(defaultPassthroughs.length);
  defaultPassthroughs.forEach(passthroughUrl => {
    var passthroughRequest = { method: 'GET', url: passthroughUrl },
        isPassedThrough = server.pretender.checkPassthrough(passthroughRequest);

    assert.ok(isPassedThrough);
  });
});

test('server does not configure default passthroughs when useDefaultPassthroughs is false', function(assert) {
  var server = new Server({ useDefaultPassthroughs: false });

  assert.expect(defaultPassthroughs.length);
  defaultPassthroughs.forEach(passthroughUrl => {
    var passthroughRequest = { method: 'GET', url: passthroughUrl },
        isPassedThrough = server.pretender.checkPassthrough(passthroughRequest);

    assert.ok(!isPassedThrough);
  });
});
