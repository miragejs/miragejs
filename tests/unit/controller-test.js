import Factory from 'ember-cli-mirage/factory';
import controller from 'ember-cli-mirage/controller';
import Db from 'ember-cli-mirage/db';

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
  var result = controller.handle('get', function(db, request) {
    return db.contacts;
  }, db, {params: {id: 1}});

  assert.deepEqual(result[2], contacts);
});

test('its default response is 204 if the verb is put', function(assert) {
  var response = controller.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 201 if the verb is post', function(assert) {
  var response = controller.handle('put', {});
  assert.equal(response[0], 204);
});

test('its default response is 204 if the verb is delete', function(assert) {
  var response = controller.handle('delete', {});
  assert.equal(response[0], 204);
});

// TODO: Use spies to ensure get#shorthand is called with appropriate args
// module('mirage:controller#get');
// module('mirage:controller#post');
// module('mirage:controller#put');
// module('mirage:controller#delete');
