import {module, test} from 'qunit';
import { Model, ActiveModelSerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Resource shorthand', {
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

test('resource generates get shorthand for index action', function(assert) {
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' }
    ]
  });

  this.server.resource('contacts');

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done(function(res, status, xhr) {
    assert.equal(xhr.status, 200);
    assert.deepEqual(res, { contacts: [{ id: '1', name: 'Link' }, { id: '2', name: 'Zelda' }] });
    done();
  });
});

test('resource generates get shorthand for show action', function(assert) {
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' }
    ]
  });

  this.server.resource('contacts');

  $.ajax({
    method: 'GET',
    url: '/contacts/2'
  }).done(function(res, status, xhr) {
    assert.equal(xhr.status, 200);
    assert.deepEqual(res, { contact: { id: '2', name: 'Zelda' } });
    done();
  });
});

test('resource generates post shorthand', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  server.resource('contacts');

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

test('resource generates put shorthand', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.resource('contacts');

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

test('resource generates patch shorthand', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.resource('contacts');

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

test('resource generates delete shorthand works', function(assert) {
  let { server } = this;
  assert.expect(2);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.resource('contacts');

  $.ajax({
    method: 'DELETE',
    url: '/contacts/1'
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 204);
    assert.equal(server.db.contacts.length, 0);
    done();
  });
});

test('resource does not accept both :all and :except options', function(assert) {
  let { server } = this;

  assert.throws(() => {
    server.resource('contacts', { only: ['index'], except: ['create'] });
  }, 'cannot use both :only and :except options');
});

test('resource generates shorthands which are whitelisted by :only option', function(assert) {
  let { server } = this;
  assert.expect(1);
  let done = assert.async();

  server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' }
    ]
  });

  server.resource('contacts', { only: ['index'] });

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 200);
    done();
  });
});

test('resource does not generate shorthands which are not whitelisted with :only option', function(assert) {
  let { server } = this;
  assert.expect(5);

  server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.resource('contacts', { only: ['index'] });

  let doneForShow = assert.async();

  $.ajax({
    method: 'GET',
    url: '/contacts/1'
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to GET '/contacts/1'") !== -1);
    doneForShow();
  });

  let doneForCreate = assert.async();

  $.ajax({
    method: 'POST',
    url: '/contacts',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to POST '/contacts'") !== -1);
    doneForCreate();
  });

  let doneForPut = assert.async();

  $.ajax({
    method: 'PUT',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to PUT '/contacts/1'") !== -1);
    doneForPut();
  });

  let doneForPatch = assert.async();

  $.ajax({
    method: 'PATCH',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to PATCH '/contacts/1'") !== -1);
    doneForPatch();
  });

  let doneForDelete = assert.async();

  $.ajax({
    method: 'DELETE',
    url: '/contacts/1'
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to DELETE '/contacts/1'") !== -1);
    doneForDelete();
  });
});

test('resource generates shorthands which are not blacklisted by :except option', function(assert) {
  let { server } = this;
  assert.expect(2);

  server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.resource('contacts', { except: ['create', 'update', 'delete'] });

  let doneForIndex = assert.async();

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 200);
    doneForIndex();
  });

  let doneForShow = assert.async();

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done((res, status, xhr) => {
    assert.equal(xhr.status, 200);
    doneForShow();
  });
});

test('resource does not generate shorthands which are blacklisted by :except option', function(assert) {
  let { server } = this;
  assert.expect(4);

  server.db.loadData({
    contacts: [
      { id: 1, name: 'Link' }
    ]
  });

  server.resource('contacts', { except: ['create', 'update', 'delete'] });

  let doneForCreate = assert.async();

  $.ajax({
    method: 'POST',
    url: '/contacts',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to POST '/contacts'") !== -1);
    doneForCreate();
  });

  let doneForPut = assert.async();

  $.ajax({
    method: 'PUT',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to PUT '/contacts/1'") !== -1);
    doneForPut();
  });

  let doneForPatch = assert.async();

  $.ajax({
    method: 'PATCH',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to PATCH '/contacts/1'") !== -1);
    doneForPatch();
  });

  let doneForDelete = assert.async();

  $.ajax({
    method: 'DELETE',
    url: '/contacts/1'
  }).fail((xhr, textStatus, error) => {
    assert.ok(error.message.indexOf("Mirage: Your Ember app tried to DELETE '/contacts/1'") !== -1);
    doneForDelete();
  });
});
