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

  test('mirage responds to get', function(assert) {
    assert.expect(1);
    let done = assert.async();

    this.server.get('/contacts', function() {
      return true;
    });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, true);
      done();
    });
  });

  test('mirage responds to post', function(assert) {
    assert.expect(1);
    let done = assert.async();

    this.server.post('/contacts', function() {
      return true;
    });

    promiseAjax({
      method: 'POST',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, true);
      done();
    });
  });

  test('mirage responds to put', function(assert) {
    assert.expect(1);
    let done = assert.async();

    this.server.put('/contacts', function() {
      return true;
    });

    promiseAjax({
      method: 'PUT',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, true);
      done();
    });
  });

  test('mirage responds to delete', function(assert) {
    assert.expect(1);
    let done = assert.async();

    this.server.delete('/contacts', function() {
      return true;
    });

    promiseAjax({
      method: 'DELETE',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, true);
      done();
    });
  });

  test('mirage responds to patch', function(assert) {
    assert.expect(1);
    let done = assert.async();

    this.server.patch('/contacts', function() {
      return true;
    });

    promiseAjax({
      method: 'PATCH',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, true);
      done();
    });
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

  test('response code can be customized', function(assert) {
    assert.expect(1);
    let done = assert.async();

    this.server.get('/contacts', {}, 404);

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).catch(function(error) {
      assert.ok(error.xhr.status, 404);
      done();
    });
  });
});
