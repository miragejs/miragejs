import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('Integration | Passthrough', {
  beforeEach() {
    this.server = new Server({
      environment: 'development'
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach() {
    this.server.shutdown();
  }
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

  $.ajax({
    method: 'GET',
    url: '/contacts',
    success(data) {
      assert.equal(data, 123);
      done1();
    }
  });

  $.ajax({
    method: 'GET',
    url: '/addresses',
    error(reason) {
      assert.equal(reason.status, 404);
      done2();
    }
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

  $.ajax({
    method: 'GET',
    url: '/contacts',
    success(data) {
      assert.equal(data, 123);
      done1();
    }
  });

  $.ajax({
    method: 'GET',
    url: '/addresses'
  });

  $.ajax({
    method: 'POST',
    url: '/addresses',
    error(reason) {
      assert.equal(reason.status, 404);
      done3();
    }
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

  $.ajax({
    method: 'GET',
    url: '/contacts',
    error(reason) {
      assert.equal(reason.status, 404);
      done1();
    }
  });

  $.ajax({
    method: 'POST',
    url: '/addresses',
    error(reason) {
      assert.equal(reason.status, 404);
      done2();
    }
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

  $.ajax({
    method: 'GET',
    url: '/contacts',
    error(reason) {
      assert.equal(reason.status, 404);
      done1();
    }
  });

  $.ajax({
    method: 'POST',
    url: '/addresses',
    error(reason) {
      assert.equal(reason.status, 404);
      done2();
    }
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

  $.ajax({
    method: 'GET',
    url: '/contacts',
    success(data) {
      assert.equal(data, 123);
      done1();
    }
  });

  $.ajax({
    method: 'GET',
    url: '/addresses',
    error(/* reason */) {
      assert.ok(true);
      done2();
    }
  });
});

test('passthrough without args allows index route on current domain to passthrough', function(assert) {
  assert.expect(2);
  var done1 = assert.async();
  var done2 = assert.async();
  var server = this.server;

  server.loadConfig(function() {
    this.get('/contacts', function() {
      return 123;
    });
    this.passthrough();
  });

  $.ajax({
    method: "GET",
    url: "/contacts",
    success: function(data) {
      assert.equal(data, 123);
      done1();
    }
  });

  $.ajax({
    method: "GET",
    url: "/",
    error: function(reason) {
      assert.equal(reason.status, 404);
      done2();
    }
  });
});

test('it can passthrough other-origin hosts', function(assert) {
  assert.expect(1);
  let done1 = assert.async();
  let { server } = this;

  server.loadConfig(function() {
    this.passthrough('http://api.foo.bar/**');
  });

  $.ajax({
    method: 'GET',
    url: 'http://api.foo.bar/contacts',
    error() {
      assert.ok(true);
      done1();
    }
  });
});

