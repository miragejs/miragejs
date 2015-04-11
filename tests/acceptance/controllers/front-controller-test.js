import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Db from 'ember-cli-mirage/db';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;

module('mirage:frontController', {
  beforeEach: function() {
    App = startApp();
    db = new Db();
    db.createCollections('contacts', 'addresses');
    db.contacts.insert(contacts);
    db.addresses.insert(addresses);
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("function handler works", function(assert) {
  var result = controller.handle('get', function(db, request) {
    return db.contacts;
  }, db, {params: {id: 1}});

  assert.deepEqual(result[2], contacts);
});
