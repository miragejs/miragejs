import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import { Model } from 'ember-cli-mirage';
import promiseAjax from '../helpers/promise-ajax';

module('Integration | HTTP Verbs', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'development',
      models: {
        contact: Model
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('mirage responds to get', async function(assert) {
    assert.expect(1);

    this.server.get('/contacts', function() {
      return true;
    });

    let { data } = await promiseAjax({
      method: 'GET',
      url: '/contacts'
    });

    assert.equal(data, true);
  });

  test('mirage responds to post', async function(assert) {
    assert.expect(1);

    this.server.post('/contacts', function() {
      return true;
    });

    let { data } = await promiseAjax({
      method: 'POST',
      url: '/contacts'
    });

    assert.equal(data, true);
  });

  test('mirage responds to put', async function(assert) {
    assert.expect(1);

    this.server.put('/contacts', function() {
      return true;
    });

    let { data } = await promiseAjax({
      method: 'PUT',
      url: '/contacts'
    });

    assert.equal(data, true);
  });

  test('mirage responds to delete', async function(assert) {
    assert.expect(1);

    this.server.delete('/contacts', function() {
      return true;
    });

    let { data } = await promiseAjax({
      method: 'DELETE',
      url: '/contacts'
    });

    assert.equal(data, true);
  });

  test('mirage responds to patch', async function(assert) {
    assert.expect(1);

    this.server.patch('/contacts', function() {
      return true;
    });

    let { data } = await promiseAjax({
      method: 'PATCH',
      url: '/contacts'
    });

    assert.equal(data, true);
  });

  test('mirage responds to resource', function(assert) {
    assert.expect(0);
    let done = assert.async();

    this.server.resource('contacts');

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then(function() {
      done();
    });
  });

  test('response code can be customized', async function(assert) {
    assert.expect(1);

    this.server.get('/contacts', {}, 404);

    try {
      await promiseAjax({
        method: 'GET',
        url: '/contacts'
      });
    } catch(e) {
      assert.ok(e.xhr.status, 404);
    }
  });
});
