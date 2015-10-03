import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../helpers/start-app';

var App, appStore, rex, toby, sam, andy;

module('Acceptance: Custom handlers', {
  beforeEach: function() {
    App = startApp();
    appStore = App.__container__.lookup('service:store');
    rex  = server.create('pet', { name: 'Rex',  alive: true  });
    toby = server.create('pet', { name: 'Toby', alive: false });
    sam  = server.create('pet', { name: 'Sam',  alive: false });
    andy = server.create('pet', { name: 'Andy', alive: true  });
  },
  afterEach: function() {
    server.shutdown();
    Ember.run(App, 'destroy');
  }
});

test("You can customize the response by passing a handler function that returns the desired body", function(assert) {
  var done = assert.async();
  appStore.findAll('pet').then(function(pets) {
    assert.deepEqual(pets.mapBy('name'), ['Rex', 'Andy']);
  }).finally(done);
});

test("You can customize the response code of a custom handler passing the code as 3rd argument", function(assert) {
  var done = assert.async();
  var request = Ember.$.ajax({
    url: '/pets/' + rex.id,
    method: 'delete'
  });

  request.then(function(response, statusText, jqXHR) {
    assert.equal(jqXHR.status, 200, 'The status code is 200 instead od 204');
    done();
  });
});

test("You can can programatically returns a taylored response by returning a Mirage.Response", function(assert) {
  var done = assert.async();
  var request = Ember.$.ajax({
    url: '/pets',
    method: 'post',
    data: JSON.stringify({ pet: { alive: true } })
  });

  request.then(function() { /* noop */ }, function(response) {
    assert.equal(response.status, 422, 'The status code is 422');
    assert.equal(response.responseText, '{"errors":{"name":["can\'t be blank"]}}', 'The response body is correct');
    assert.equal(response.getResponseHeader('some'), 'header', 'The response contains the custom header');
    done();
  });
});

test("returning a non-blank response from a custom handler whose default status is 204 changes the status to 200", function(assert) {
  var done = assert.async();
  var request = Ember.$.ajax({
    url: '/pets/' + rex.id,
    method: 'put',
    data: JSON.stringify({ pet: { id: rex.id, name: 'The Rex', alive: true } })
  });

  request.then(function(response, statusText, jqXHR) {
    assert.equal(jqXHR.status, 200, 'The status code is 200 instead od 204');
    assert.deepEqual(response, { id: 1, name: "The Rex", alive: true }, 'The response is correct');
    done();
  });
});
