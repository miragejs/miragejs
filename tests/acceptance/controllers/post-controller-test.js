import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../../helpers/start-app';
import controller from 'ember-cli-mirage/controllers/front';
import Db from 'ember-cli-mirage/db';

var App;
var db;

module('mirage:frontController POST', {
  beforeEach: function() {
    App = startApp();
    db = new Db();
    db.createCollection('contacts');
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("string shorthand works", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', 'contact', db, {requestBody: body});

  var contactsInDb = db.contacts;
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', undefined, db, {requestBody: body, url: '/contacts'});

  var contactsInDb = db.contacts;
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});

test("undefined shorthand works when query params present", function(assert) {
  var body = '{"contact":{"name":"Ganon"}}';
  var result = controller.handle('post', undefined, db, {requestBody: body, url: '/contacts?foo=bar'});

  var contactsInDb = db.contacts;
  assert.equal(contactsInDb.length, 1);
  assert.deepEqual(result[2], {contact: {id: 1, name: 'Ganon'}});
});
