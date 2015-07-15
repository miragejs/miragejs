import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('integration:get-shorthands', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development'
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test("get undefined shorthand", function(assert) {
  assert.expect(1);
  var done = assert.async();
  var server = this.server;

  var contacts = [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'},
  ];
  server.db.loadData({
    contacts: contacts
  });
  server.get('/contacts');

  $.getJSON('/contacts', function(data) {
    assert.deepEqual(data, { contacts: contacts });
    done();
  });
});

test("get array shorthand", function(assert) {
  assert.expect(1);
  var done = assert.async();
  var server = this.server;

  var contacts = [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ];
  var addresses = [
    {id: 1, name: '123'},
    {id: 2, name: 'abc'},
  ];
  server.db.loadData({
    contacts: contacts,
    addresses: addresses
  });
  server.get('/contacts', ['contacts', 'addresses']);

  $.getJSON('/contacts', function(data) {
    assert.deepEqual(data, {
      contacts: contacts,
      addresses: addresses
    });
    done();
  });
});

// add tests for other shorthands
