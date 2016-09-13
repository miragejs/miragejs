import {module, test} from 'qunit';
import { Model } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import ActiveModelSerializer from 'ember-cli-mirage/serializers/active-model-serializer';
import RestSerializer from 'ember-cli-mirage/serializers/rest-serializer';

module('Integration | Server Config', {
  beforeEach() {
    this.server = new Server({
      environment: 'development',
      models: {
        contact: Model,
        post: Model
      },
      serializers: {
        contact: ActiveModelSerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('namespace can be configured', function(assert) {
  assert.expect(1);
  let done = assert.async();

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  this.server.db.loadData({
    contacts
  });
  this.server.namespace = 'api';
  this.server.get('/contacts');

  $.getJSON('/api/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('urlPrefix can be configured', function(assert) {
  assert.expect(1);
  let done = assert.async();
  let { server } = this;

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  server.db.loadData({
    contacts
  });
  server.urlPrefix = 'http://localhost:3000';
  server.get('/contacts');

  $.getJSON('http://localhost:3000/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('urlPrefix and namespace can be configured simultaneously', function(assert) {
  assert.expect(1);
  let done = assert.async();
  let { server } = this;

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  server.db.loadData({
    contacts
  });
  server.urlPrefix = 'http://localhost:3000';
  server.namespace = 'api';
  server.get('/contacts');

  $.getJSON('http://localhost:3000/api/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('fully qualified domain names can be used in configuration', function(assert) {
  assert.expect(1);
  let done = assert.async();

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  this.server.db.loadData({
    contacts
  });
  this.server.get('http://example.org/api/contacts');

  $.getJSON('http://example.org/api/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('urlPrefix/namespace are ignored when fully qualified domain names are used in configuration', function(assert) {
  assert.expect(1);
  let done = assert.async();
  let { server } = this;

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  server.db.loadData({
    contacts
  });
  this.urlPrefix = 'https://example.net';
  server.get('http://example.org/api/contacts');

  $.getJSON('http://example.org/api/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('blank urlPrefix and namespace ends up as /', function(assert) {
  assert.expect(1);
  let done = assert.async();

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  this.server.db.loadData({
    contacts
  });
  this.server.namespace = '';
  this.server.urlPrefix = '';
  this.server.get('contacts');

  $.getJSON('/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('namespace with no slash gets one', function(assert) {
  assert.expect(1);
  let done = assert.async();

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  this.server.db.loadData({
    contacts
  });
  this.server.namespace = 'api';
  this.server.get('contacts');

  $.getJSON('/api/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('urlPrefix with no slash gets one', function(assert) {
  assert.expect(1);
  let done = assert.async();

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  this.server.db.loadData({
    contacts
  });
  this.server.urlPrefix = 'pre';
  this.server.get('contacts');

  $.getJSON('/pre/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('namespace of / works', function(assert) {
  assert.expect(1);
  let done = assert.async();

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  this.server.db.loadData({
    contacts
  });
  this.server.namespace = '/';
  this.server.get('contacts');

  $.getJSON('/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
});

test('redefining options using the config method works', function(assert) {
  assert.expect(5);
  let done = assert.async();
  let { server } = this;

  let contacts = [
    { id: '1', name: 'Link' },
    { id: '2', name: 'Zelda' }
  ];
  server.config({
    namespace: 'api',
    urlPrefix: 'http://localhost:3000',
    timing: 1000,
    serializers: {
      post: RestSerializer
    }
  });
  server.db.loadData({
    contacts
  });
  server.get('contacts');

  assert.equal(server.timing, 1000);
  $.getJSON('http://localhost:3000/api/contacts', function(data) {
    assert.deepEqual(data, { contacts });
    done();
  });
  let serializerMap = server.serializerOrRegistry._serializerMap;
  assert.equal(Object.keys(serializerMap).length, 2);
  assert.equal(serializerMap.contact, ActiveModelSerializer);
  assert.equal(serializerMap.post, RestSerializer);
});

test('changing the environment of the server throws an error', function(assert) {
  let { server } = this;

  assert.throws(function() {
    server.config({
      environment: 'test'
    });
  }, /You cannot modify Mirage's environment once the server is created/);
});
