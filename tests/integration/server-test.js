import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('Integration: Server', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development'
    });
    this.server.timing = 0;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test("get undefined shorthand", function(assert) {
  var done = assert.async();

  var contacts = [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'},
  ];
  this.server.db.loadData({
    contacts: contacts
  });
  this.server.get('/contacts');

  $.getJSON('/contacts', function(data) {
    assert.deepEqual(data, { contacts: contacts });
    done();
  });
});

test("get array shorthand", function(assert) {
  var done = assert.async();

  var contacts = [
    {id: 1, name: 'Link'},
    {id: 2, name: 'Zelda'}
  ];
  var addresses = [
    {id: 1, name: '123'},
    {id: 2, name: 'abc'},
  ];
  this.server.db.loadData({
    contacts: contacts,
    addresses: addresses
  });
  this.server.get('/contacts', ['contacts', 'addresses']);

  $.getJSON('/contacts', function(data) {
    assert.deepEqual(data, {
      contacts: contacts,
      addresses: addresses
    });
    done();
  });
});

// add tests for other shorthands
