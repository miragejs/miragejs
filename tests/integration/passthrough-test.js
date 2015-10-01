import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('Integration | Passthrough', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development'
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('it can passthrough individual paths', function(assert) {
  assert.expect(2);
  var done1 = assert.async();
  var done2 = assert.async();
  var server = this.server;

  server.loadConfig(function() {
    this.get('/contacts', function() {
      return 123;
    });
    this.passthrough('/addresses');
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
    url: "/addresses",
    error: function(reason) {
      assert.equal(reason.status, 404);
      done2();
    }
  });
});

test('it can passthrough certain verbs for individual paths', function(assert) {
  assert.expect(3);
  var done1 = assert.async();
  var done2 = assert.async();
  var done3 = assert.async();
  var server = this.server;

  server.loadConfig(function() {
    this.get('/contacts', function() {
      return 123;
    });
    this.passthrough('/addresses', ['post']);
  });
  server.pretender.unhandledRequest = function(verb, path) {
    assert.ok(true, 'it doesnt passthrough GET');
    done2();
  };


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
    url: "/addresses"
  });

  $.ajax({
    method: "POST",
    url: "/addresses",
    error: function(reason) {
      assert.equal(reason.status, 404);
      done3();
    }
  });
});

test('it can passthrough multiple paths in a single call', function(assert) {
  assert.expect(2);
  var done1 = assert.async();
  var done2 = assert.async();
  var server = this.server;

  server.loadConfig(function() {
    this.get('/contacts', function() {
      return 123;
    });
    this.passthrough('/contacts', '/addresses');
  });

  $.ajax({
    method: "GET",
    url: "/contacts",
    error: function(reason) {
      assert.equal(reason.status, 404);
      done1();
    }
  });

  $.ajax({
    method: "POST",
    url: "/addresses",
    error: function(reason) {
      assert.equal(reason.status, 404);
      done2();
    }
  });
});

test('user can call passthrough multiple times', function(assert) {
  assert.expect(2);
  var done1 = assert.async();
  var done2 = assert.async();
  var server = this.server;

  server.loadConfig(function() {
    this.passthrough('/contacts');
    this.passthrough('/addresses', ['post']);
  });

  $.ajax({
    method: "GET",
    url: "/contacts",
    error: function(reason) {
      assert.equal(reason.status, 404);
      done1();
    }
  });

  $.ajax({
    method: "POST",
    url: "/addresses",
    error: function(reason) {
      assert.equal(reason.status, 404);
      done2();
    }
  });
});

test('passthrough without args allows all paths on the current domain to passthrough', function(assert) {
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
    url: "/addresses",
    error: function(reason) {
      assert.ok(true);
      done2();
    }
  });
});

test('it can passthrough other-origin hosts', function(assert) {
  assert.expect(1);
  var done1 = assert.async();
  var server = this.server;

  server.loadConfig(function() {
    this.passthrough('http://api.foo.bar/**');
  });

  $.ajax({
    method: "GET",
    url: "http://api.foo.bar/contacts",
    error: function() {
      assert.ok(true);
      done1();
    }
  });
});

