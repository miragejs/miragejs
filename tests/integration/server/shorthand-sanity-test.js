import {module, test} from 'qunit';
import { Model, ActiveModelSerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Shorthand sanity check', {
  beforeEach() {
    this.server = new Server({
      environment: 'test',
      models: {
        contact: Model
      },
      serializers: {
        application: ActiveModelSerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('a get shorthand works', function(assert) {
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  this.server.get('/contacts');

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done(function(res, status, xhr) {
    assert.equal(xhr.status, 200);
    assert.deepEqual(res, { contacts: [{ id: '1', name: 'Link' }] });
    done();
  });
});

test('a post shorthand works', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  server.post('/contacts');

  $.ajax({
    method: 'POST',
    url: '/contacts',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 201);
    assert.equal(server.db.contacts.length, 1);
    done();
  });
});

test('a put shorthand works', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.put('/contacts/:id');

  $.ajax({
    method: 'PUT',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 200);
    assert.equal(server.db.contacts[0].name, 'Zelda');
    done();
  });
});

test('a patch shorthand works', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.patch('/contacts/:id');

  $.ajax({
    method: 'PATCH',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 200);
    assert.equal(server.db.contacts[0].name, 'Zelda');
    done();
  });
});

test('a delete shorthand works', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.del('/contacts/:id');

  $.ajax({
    method: 'DELETE',
    url: '/contacts/1'
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 204);
    assert.equal(server.db.contacts.length, 0);
    done();
  });
});
