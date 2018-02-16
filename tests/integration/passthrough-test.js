import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import promiseAjax from '../helpers/promise-ajax';

module('Integration | Passthrough', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'development'
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it can passthrough individual paths', function(assert) {
    assert.expect(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get('/contacts', function() {
        return 123;
      });
      this.passthrough('/addresses');
    });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, 123);
      done1();
    });

    promiseAjax({
      method: 'GET',
      url: '/addresses'
    }).catch((error) => {
      assert.equal(error.xhr.status, 404);
      done2();
    });
  });

  test('it can passthrough certain verbs for individual paths', function(assert) {
    assert.expect(3);
    let done1 = assert.async();
    let done2 = assert.async();
    let done3 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get('/contacts', function() {
        return 123;
      });
      this.passthrough('/addresses', ['post']);
    });
    server.pretender.unhandledRequest = function(/* verb, path */) {
      assert.ok(true, 'it doesnt passthrough GET');
      done2();
    };

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, 123);
      done1();
    });

    promiseAjax({
      method: 'GET',
      url: '/addresses'
    });

    promiseAjax({
      method: 'POST',
      url: '/addresses'
    }).catch((error) => {
      assert.equal(error.xhr.status, 404);
      done3();
    });
  });

  test('it can passthrough multiple paths in a single call', function(assert) {
    assert.expect(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get('/contacts', function() {
        return 123;
      });
      this.passthrough('/contacts', '/addresses');
    });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).catch((error) => {
      assert.equal(error.xhr.status, 404);
      done1();
    });

    promiseAjax({
      method: 'POST',
      url: '/addresses'
    }).catch((error) => {
      assert.equal(error.xhr.status, 404);
      done2();
    });
  });

  test('user can call passthrough multiple times', function(assert) {
    assert.expect(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.passthrough('/contacts');
      this.passthrough('/addresses', ['post']);
    });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).catch((error) => {
      assert.equal(error.xhr.status, 404);
      done1();
    });

    promiseAjax({
      method: 'POST',
      url: '/addresses'
    }).catch((error) => {
      assert.equal(error.xhr.status, 404);
      done2();
    });
  });

  test('passthrough without args allows all paths on the current domain to passthrough', function(assert) {
    assert.expect(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get('/contacts', function() {
        return 123;
      });
      this.passthrough();
    });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, 123);
      done1();
    });

    promiseAjax({
      method: 'GET',
      url: '/addresses'
    }).catch((error) => {
      assert.equal(error.xhr.status, 404);
      done2();
    });
  });

  test('passthrough without args allows index route on current domain to passthrough', function(assert) {
    assert.expect(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get('/contacts', function() {
        return 123;
      });
      this.passthrough();
    });

    promiseAjax({
      method: 'GET',
      url: '/contacts'
    }).then((response) => {
      assert.equal(response.data, 123, 'contacts is intercepted');
      done1(); // test will fail bc only 1 assertion, but we don't have to wait
    });

    promiseAjax({
      method: 'GET',
      url: '/'
    }).then((response) => {
      // a passthrough request to index on the current domain
      // actually succeeds here, since that's where the test runner is served
      assert.ok(response.data, '/ is passed through');
      done2();
    }).catch(() => {
      done2(); // test will fail bc only 1 assertion, but we don't have to wait
    });
  });

  test('it can passthrough other-origin hosts', function(assert) {
    assert.expect(1);
    let done1 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.passthrough('http://api.foo.bar/**');
    });

    promiseAjax({
      method: 'GET',
      url: '/addresses'
    }).catch((error) => {
      assert.ok(true);
      done1();
    });
  });
});
