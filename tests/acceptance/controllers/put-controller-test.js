import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Db from 'ember-cli-mirage/db';

var App;
var contacts = [{id: 1, name: 'Link', address_ids: [1]}, {id: 2, name: 'Zelda', address_ids: [2]}];
var addresses = [{id: 1, name: '123 Hyrule Way', contact_id: 1}, {id: 2, name: '456 Hyrule Way', contact_id: 2}];
var db;

module('mirage:frontController PUT', {
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

test("string shorthand works", function(assert) {
  var Link = db.contacts.find(1);
  assert.equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', 'contact', db, {params: {id: 1}, requestBody: body});

  Link = db.contacts.find(1);
  assert.equal(Link.name, 'Linkz0r');
});

test("undefined shorthand works", function(assert) {
  var Link = db.contacts.find(1);
  assert.equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', undefined, db, {params: {id: 1}, url: '/contacts/1', requestBody: body});

  Link = db.contacts.find(1);
  assert.equal(Link.name, 'Linkz0r');
});

test("undefined shorthand works when query params present", function(assert) {
  var Link = db.contacts.find(1);
  assert.equal(Link.name, 'Link');

  var body = '{"contact":{"id":1,"name":"Linkz0r"}}';
  var result = controller.handle('put', undefined, db, {params: {id: 1}, url: '/contacts/1?some=foo', requestBody: body});

  Link = db.contacts.find(1);
  assert.equal(Link.name, 'Linkz0r');
});
