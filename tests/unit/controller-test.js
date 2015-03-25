import Factory from 'ember-cli-mirage/factory';
import controller from 'ember-cli-mirage/controller';
import Db from 'ember-cli-mirage/orm/db';
import Response from 'ember-cli-mirage/response';

import {module, test} from 'qunit';

var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;
module('mirage:controller', {
  beforeEach: function() {
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  }
});

test("function handler works", function(assert) {
  var response = controller.handle('get', function(db, request) {
    return db.contacts.all();
  }, db, {params: {id: 1}});

  assert.deepEqual(response[2], contacts);
});

test("function handler works with custom response", function(assert) {
  var response = controller.handle('get', function(db, request) {
    return new Response(201, {some: 'header'}, {some: 'data'});
  }, db);

  assert.deepEqual(response, [201, {some: 'header'}, {some: 'data'}]);
});

test('its default response is 200 if the verb is get', function(assert) {
  var response = controller.handle('get', {});
  assert.equal(response[0], 200);
});

test('its default response is 204 if the verb is put and the response is empty', function(assert) {
  var response = controller.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 200 if the verb is put and the response is not empty and no specific code passed', function(assert) {
  var response = controller.handle('put', function() {
    return { text: 'thanks' };
  });
  assert.equal(response[0], 200, 'Returning a non-empty object changes the default code to 200');

  var response2 = controller.handle('put', function() {
    return [];
  });
  assert.equal(response2[0], 200, 'An empty array IS NOT an empty response');

  var response3 = controller.handle('put', function() {
    return;
  });
  assert.equal(response3[0], 204, 'undefined is considered an empty response');

  var response4 = controller.handle('put', function() {
    return '';
  });
  assert.equal(response4[0], 204, 'An empty string is considered and empty response');

  var response5 = controller.handle('put', function() {
    return;
  }, 204);
  assert.equal(response4[0], 204, 'If the response code is forced, that takes precedence');

  var response6 = controller.handle('put', function() {
    return {};
  }, 204);
  assert.equal(response6[0], 204, 'An empty object is considered and empty response');
});

test('its default response is 201 if the verb is post', function(assert) {
  var response = controller.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 204 if the verb is delete and the response is empty', function(assert) {
  var response = controller.handle('delete', {});
  assert.equal(response[0], 204);
});

test('its default response is 200 if the verb is delete and the response is not empty and no specific code passed', function(assert) {
  var response = controller.handle('delete', function() {
    return { text: 'thanks' };
  });
  assert.equal(response[0], 200, 'Returning a non-empty object changes the default code to 200');

  var response2 = controller.handle('delete', function() {
    return [];
  });
  assert.equal(response2[0], 200, 'An empty array IS NOT an empty response');

  var response3 = controller.handle('delete', function() {
    return;
  });
  assert.equal(response3[0], 204, 'undefined is considered an empty response');

  var response4 = controller.handle('delete', function() {
    return '';
  });
  assert.equal(response4[0], 204, 'An empty string is considered and empty response');

  var response5 = controller.handle('delete', function() {
    return;
  }, 204);
  assert.equal(response4[0], 204, 'If the response code is forced, that takes precedence');

  var response6 = controller.handle('delete', function() {
    return {};
  }, 204);
  assert.equal(response6[0], 204, 'An empty object is considered and empty response');
});

// TODO: Use spies to ensure get#shorthand is called with appropriate args
// module('mirage:controller#get');
// module('mirage:controller#post');
// module('mirage:controller#put');
// module('mirage:controller#delete');
