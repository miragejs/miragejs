import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Get full path', function(hooks) {
  hooks.beforeEach(function() {
    this.server = new Server({
      environment: 'test'
    });
    this.server.timing = 0;
    this.server.logging = false;
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('it works with a configured namespace with a leading slash', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.namespace = '/api';

    assert.equal(server._getFullPath('/contacts'), '/api/contacts');
  });

  test('it works with a configured namespace with a trailing slash', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.namespace = 'api/';

    assert.equal(server._getFullPath('/contacts'), '/api/contacts');
  });

  test('it works with a configured namespace without a leading slash', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.namespace = 'api';

    assert.equal(server._getFullPath('/contacts'), '/api/contacts');
  });

  test('it works with a configured namespace is an empty string', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.namespace = '';

    assert.equal(server._getFullPath('/contacts'), '/contacts');
  });

  test('it works with a configured urlPrefix with a trailing slash', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.urlPrefix = 'http://localhost:3000/';

    assert.equal(server._getFullPath('/contacts'), 'http://localhost:3000/contacts');
  });

  test('it works with a configured urlPrefix without a trailing slash', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.urlPrefix = 'http://localhost:3000';

    assert.equal(server._getFullPath('/contacts'), 'http://localhost:3000/contacts');
  });

  test('it works with a configured urlPrefix as an empty string', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.urlPrefix = '';

    assert.equal(server._getFullPath('/contacts'), '/contacts');
  });

  test('it works with a configured namespace and a urlPrefix', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.namespace = 'api';
    server.urlPrefix = 'http://localhost:3000';

    assert.equal(server._getFullPath('/contacts'), 'http://localhost:3000/api/contacts');
  });

  test('it works with a configured namespace with a leading slash and a urlPrefix', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.namespace = '/api';
    server.urlPrefix = 'http://localhost:3000';

    assert.equal(server._getFullPath('/contacts'), 'http://localhost:3000/api/contacts');
  });

  test('it works with a configured namespace and a urlPrefix as empty strings', function(assert) {
    assert.expect(1);
    let { server } = this;
    server.namespace = '';
    server.urlPrefix = '';

    assert.equal(server._getFullPath('/contacts'), '/contacts');
  });
});