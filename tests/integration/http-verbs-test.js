import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';

module('integration:http-verbs', {
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

test('mirage responds to get', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.get('/contacts', function() {
    return true;
  });

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done(function(res) {
    assert.ok(res);
    done();
  });
});

test('mirage responds to post', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.post('/contacts', function() {
    return true;
  });

  $.ajax({
    method: 'POST',
    url: '/contacts'
  }).done(function(res) {
    assert.ok(res);
    done();
  });
});

test('mirage responds to put', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.put('/contacts', function() {
    return true;
  });

  $.ajax({
    method: 'PUT',
    url: '/contacts'
  }).done(function(res) {
    assert.ok(res);
    done();
  });
});

test('mirage responds to delete', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server['delete']('/contacts', function() {
    return true;
  });

  $.ajax({
    method: 'DELETE',
    url: '/contacts'
  }).done(function(res) {
    assert.ok(res);
    done();
  });
});

test('mirage responds to patch', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.patch('/contacts', function() {
    return true;
  });

  $.ajax({
    method: 'PATCH',
    url: '/contacts'
  }).done(function(res) {
    assert.ok(res);
    done();
  });
});
