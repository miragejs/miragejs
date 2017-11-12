import {module, test} from 'qunit';
import { Model, ActiveModelSerializer } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import promiseAjax from '../../helpers/promise-ajax';

module('Integration | Server | Shorthand sanity check', function(hooks) {
  hooks.beforeEach(function() {
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
  });

  hooks.afterEach(function() {
    this.server.shutdown();
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

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
      assert.deepEqual(response.data, { contacts: [{ id: '1', name: 'Link' }] });
      done();
    });
  });

  test('a post shorthand works', function(assert) {
    let { server } = this;
    assert.expect(2);
    let done = assert.async();

    server.post('/contacts');

    promiseAjax({
      method: 'POST',
      url: '/contacts',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).then((response) => {
      assert.equal(response.xhr.status, 201);
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

    promiseAjax({
      method: 'PUT',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
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

    promiseAjax({
      method: 'PATCH',
      url: '/contacts/1',
      data: JSON.stringify({
        contact: {
          name: 'Zelda'
        }
      })
    }).then((response) => {
      assert.equal(response.xhr.status, 200);
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

    promiseAjax({
      method: 'DELETE',
      url: '/contacts/1'
    }).then((response) => {
      assert.equal(response.xhr.status, 204);
      assert.equal(server.db.contacts.length, 0);
      done();
    });
  });
});
